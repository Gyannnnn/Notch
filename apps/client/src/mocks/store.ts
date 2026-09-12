import { useCallback, useSyncExternalStore } from "react";

import type {
  FoodItem,
  FoodLog,
  LoggedVia,
  MealSlot,
  NotificationPrefs,
  PhotoAngle,
  PrivacyPrefs,
  ProgressPhoto,
  StreakState,
  Subscription,
  User,
  WeightEntry,
} from "@/types/domain";
import { localDateKey } from "@/lib/date";
import { macrosForPortion } from "@/lib/macros";
import { targetsForUser } from "@/lib/targets";
import { FOOD_ITEMS } from "./foods";
import {
  DEFAULT_NOTIFICATION_PREFS,
  DEFAULT_PRIVACY_PREFS,
  MOCK_LOGS,
  MOCK_PHOTOS,
  MOCK_STREAK,
  MOCK_SUBSCRIPTION,
  MOCK_USER,
  MOCK_WEIGHT_ENTRIES,
  NEW_USER,
  NEW_USER_STREAK,
} from "./fixtures";

/**
 * In-memory stand-in for the API. Screens never touch this directly — they go
 * through the hooks in src/hooks, which is the only layer that changes when
 * real requests are wired in.
 */
export interface MockState {
  user: User;
  /** Every log the account has, across all days — not just today's. */
  logs: FoodLog[];
  weightEntries: WeightEntry[];
  photos: ProgressPhoto[];
  streak: StreakState;
  subscription: Subscription;
  /** Foods the user typed in themselves, searchable alongside the catalog. */
  customFoods: FoodItem[];
  notifications: NotificationPrefs;
  privacy: PrivacyPrefs;
}

export type Dataset = "populated" | "new";

const datasets: Record<Dataset, () => MockState> = {
  populated: () => ({
    user: { ...MOCK_USER },
    logs: [...MOCK_LOGS],
    weightEntries: [...MOCK_WEIGHT_ENTRIES],
    photos: [...MOCK_PHOTOS],
    streak: { ...MOCK_STREAK },
    subscription: { ...MOCK_SUBSCRIPTION },
    customFoods: [],
    notifications: { ...DEFAULT_NOTIFICATION_PREFS },
    privacy: { ...DEFAULT_PRIVACY_PREFS },
  }),
  new: () => ({
    user: { ...NEW_USER },
    logs: [],
    weightEntries: [],
    photos: [],
    streak: { ...NEW_USER_STREAK },
    subscription: { ...MOCK_SUBSCRIPTION },
    customFoods: [],
    notifications: { ...DEFAULT_NOTIFICATION_PREFS },
    privacy: { ...DEFAULT_PRIVACY_PREFS },
  }),
};

let state: MockState = datasets.populated();
let dataset: Dataset = "populated";
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

function set(update: (current: MockState) => MockState) {
  state = update(state);
  emit();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useMockState<T>(select: (s: MockState) => T): T {
  return useSyncExternalStore(
    subscribe,
    useCallback(() => select(state), [select]),
  );
}

export const getState = () => state;
export const getDataset = () => dataset;

/** The catalog plus anything the user added by hand. */
export const lookupFood = (id: string): FoodItem | undefined =>
  FOOD_ITEMS.find((f) => f.id === id) ?? state.customFoods.find((f) => f.id === id);

const uid = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

/** Any qualifying log counts once per day, matching the streak rule in PRD 6.6. */
function withStreakCredit(current: MockState, dateKey = localDateKey()): MockState {
  // Backfilling an older day is allowed, but only today's activity can extend
  // the streak — crediting a past date would let a user rebuild a broken
  // streak retroactively, which the PRD's forgiveness model handles with
  // freezes instead.
  if (dateKey !== localDateKey()) return current;
  if (current.streak.activeDates.includes(dateKey)) return current;

  const currentStreak = current.streak.currentStreak + 1;
  return {
    ...current,
    streak: {
      ...current.streak,
      currentStreak,
      longestStreak: Math.max(currentStreak, current.streak.longestStreak),
      lastActiveLocalDate: dateKey,
      activeDates: [dateKey, ...current.streak.activeDates],
    },
  };
}

/** Keeps the clock-time of a log while moving it onto a given calendar day. */
function timestampFor(dateKey: string): string {
  const now = new Date();
  if (dateKey === localDateKey()) return now.toISOString();
  const [year, month, day] = dateKey.split("-").map(Number);
  const d = new Date(now);
  d.setFullYear(year!, month! - 1, day!);
  return d.toISOString();
}

/**
 * Targets follow the profile. Onboarding, profile edits and every weigh-in all
 * run through `updateUser`, so re-deriving here is what keeps a goal change
 * from leaving a stale calorie number on the home screen — rather than each
 * caller remembering to do it.
 *
 * Two things stop it: the user having typed their own targets, and a patch
 * that is itself setting targets (which is how they type them).
 */
function withDerivedTargets(user: User, patch: Partial<User>): User {
  const patchesTargets =
    "dailyCalorieTarget" in patch ||
    "dailyProteinTargetG" in patch ||
    "dailyCarbsTargetG" in patch ||
    "dailyFatTargetG" in patch;
  if (user.targetsCustom || patchesTargets) return user;

  const derived = targetsForUser(user);
  if (!derived) return user;

  return {
    ...user,
    dailyCalorieTarget: derived.calories,
    dailyProteinTargetG: derived.proteinG,
    dailyCarbsTargetG: derived.carbsG,
    dailyFatTargetG: derived.fatG,
  };
}

export const actions = {
  logFood(input: {
    foodItemId: string;
    grams: number;
    mealSlot: MealSlot;
    loggedVia: LoggedVia;
    /** Local date key to log against. Defaults to today. */
    dateKey?: string;
  }) {
    const item = lookupFood(input.foodItemId);
    if (!item) return;
    const dateKey = input.dateKey ?? localDateKey();
    const entry: FoodLog = {
      id: uid("log"),
      foodItemId: item.id,
      name: item.name,
      portionGrams: input.grams,
      portionLabel: item.portionLabel,
      ...macrosForPortion(item, input.grams),
      mealSlot: input.mealSlot,
      loggedVia: input.loggedVia,
      loggedAt: timestampFor(dateKey),
    };
    set((s) => withStreakCredit({ ...s, logs: [...s.logs, entry] }, dateKey));
  },

  /**
   * Rescales the log's own stored macros rather than re-reading the catalog.
   * The schema snapshots nutrition at log time precisely so a later correction
   * to a food item can't rewrite history, and editing a portion shouldn't
   * quietly opt that log back into live catalog values.
   */
  updateLog(id: string, patch: { portionGrams?: number; mealSlot?: MealSlot }) {
    set((s) => ({
      ...s,
      logs: s.logs.map((log) => {
        if (log.id !== id) return log;
        const next = { ...log, ...(patch.mealSlot && { mealSlot: patch.mealSlot }) };
        if (patch.portionGrams === undefined || patch.portionGrams === log.portionGrams) {
          return next;
        }
        const ratio = patch.portionGrams / log.portionGrams;
        return {
          ...next,
          portionGrams: patch.portionGrams,
          caloriesLogged: Math.round(log.caloriesLogged * ratio),
          proteinLoggedG: Math.round(log.proteinLoggedG * ratio),
          carbsLoggedG: Math.round(log.carbsLoggedG * ratio),
          fatLoggedG: Math.round(log.fatLoggedG * ratio),
        };
      }),
    }));
  },

  removeLog(id: string) {
    set((s) => ({ ...s, logs: s.logs.filter((l) => l.id !== id) }));
  },

  /** The manual fallback in PRD 6.2 — macros typed in directly, per 100g. */
  createManualFood(input: {
    name: string;
    servingSizeG: number;
    caloriesPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
  }): FoodItem {
    const item: FoodItem = {
      id: uid("custom"),
      source: "MANUAL",
      name: input.name,
      brandName: null,
      presetSlug: null,
      caloriesPer100g: input.caloriesPer100g,
      proteinPer100g: input.proteinPer100g,
      carbsPer100g: input.carbsPer100g,
      fatPer100g: input.fatPer100g,
      servingSizeG: input.servingSizeG,
      portionLabel: "1 serving",
      verifiedSource: false,
    };
    set((s) => ({ ...s, customFoods: [item, ...s.customFoods] }));
    return item;
  },

  logWeight(weightKg: number) {
    const loggedAt = new Date().toISOString();
    const entry: WeightEntry = { id: uid("weight"), weightKg, loggedAt, note: null };
    set((s) =>
      withStreakCredit({
        ...s,
        weightEntries: [...s.weightEntries, entry],
        // Through the same derivation as a profile edit: a weigh-in changes
        // bodyweight, and the calorie target is a function of bodyweight.
        user: withDerivedTargets(
          { ...s.user, currentWeightKg: weightKg, currentWeightUpdatedAt: loggedAt },
          { currentWeightKg: weightKg },
        ),
      }),
    );
  },

  addPhoto(angle: PhotoAngle, uri: string | number) {
    const photo: ProgressPhoto = {
      id: uid("photo"),
      uri,
      angle,
      weightKgAtCapture: state.user.currentWeightKg,
      capturedAt: new Date().toISOString(),
    };
    set((s) => withStreakCredit({ ...s, photos: [...s.photos, photo] }));
  },

  removePhoto(id: string) {
    set((s) => ({ ...s, photos: s.photos.filter((p) => p.id !== id) }));
  },

  updateUser(patch: Partial<User>) {
    set((s) => ({ ...s, user: withDerivedTargets({ ...s.user, ...patch }, patch) }));
  },

  updateNotifications(patch: Partial<NotificationPrefs>) {
    set((s) => ({ ...s, notifications: { ...s.notifications, ...patch } }));
  },

  updatePrivacy(patch: Partial<PrivacyPrefs>) {
    set((s) => ({ ...s, privacy: { ...s.privacy, ...patch } }));
  },

  setTier(tier: Subscription["tier"]) {
    set((s) => ({ ...s, subscription: { ...s.subscription, tier } }));
  },

  /**
   * Clears the session's data locally. The real endpoint soft-deletes and
   * purges after a grace period (see `deletedAt` in schema.prisma), which is
   * what the confirmation copy promises.
   */
  deleteAccount() {
    dataset = "new";
    set(() => datasets.new());
  },

  useDataset(next: Dataset) {
    dataset = next;
    set(() => datasets[next]());
  },
};
