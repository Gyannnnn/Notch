import { useCallback, useSyncExternalStore } from "react";

import type {
  FoodLog,
  LoggedVia,
  MealSlot,
  PhotoAngle,
  ProgressPhoto,
  StreakState,
  Subscription,
  User,
  WeightEntry,
} from "@/types/domain";
import { localDateKey } from "@/lib/date";
import { macrosForPortion } from "@/lib/macros";
import { foodById } from "./foods";
import {
  MOCK_PHOTOS,
  MOCK_STREAK,
  MOCK_SUBSCRIPTION,
  MOCK_TODAY_LOGS,
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
  logs: FoodLog[];
  weightEntries: WeightEntry[];
  photos: ProgressPhoto[];
  streak: StreakState;
  subscription: Subscription;
}

export type Dataset = "populated" | "new";

const datasets: Record<Dataset, () => MockState> = {
  populated: () => ({
    user: { ...MOCK_USER },
    logs: [...MOCK_TODAY_LOGS],
    weightEntries: [...MOCK_WEIGHT_ENTRIES],
    photos: [...MOCK_PHOTOS],
    streak: { ...MOCK_STREAK },
    subscription: { ...MOCK_SUBSCRIPTION },
  }),
  new: () => ({
    user: { ...NEW_USER },
    logs: [],
    weightEntries: [],
    photos: [],
    streak: { ...NEW_USER_STREAK },
    subscription: { ...MOCK_SUBSCRIPTION },
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

/** Any qualifying log counts once per day, matching the streak rule in PRD 6.6. */
function withStreakCredit(current: MockState): MockState {
  const today = localDateKey();
  if (current.streak.activeDates.includes(today)) return current;
  const currentStreak = current.streak.currentStreak + 1;
  return {
    ...current,
    streak: {
      ...current.streak,
      currentStreak,
      longestStreak: Math.max(currentStreak, current.streak.longestStreak),
      lastActiveLocalDate: today,
      activeDates: [today, ...current.streak.activeDates],
    },
  };
}

export const actions = {
  logFood(input: {
    foodItemId: string;
    grams: number;
    mealSlot: MealSlot;
    loggedVia: LoggedVia;
  }) {
    const item = foodById(input.foodItemId);
    if (!item) return;
    const entry: FoodLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      foodItemId: item.id,
      name: item.name,
      portionGrams: input.grams,
      portionLabel: item.portionLabel,
      ...macrosForPortion(item, input.grams),
      mealSlot: input.mealSlot,
      loggedVia: input.loggedVia,
      loggedAt: new Date().toISOString(),
    };
    set((s) => withStreakCredit({ ...s, logs: [...s.logs, entry] }));
  },

  removeLog(id: string) {
    set((s) => ({ ...s, logs: s.logs.filter((l) => l.id !== id) }));
  },

  logWeight(weightKg: number) {
    const loggedAt = new Date().toISOString();
    const entry: WeightEntry = { id: `weight_${Date.now()}`, weightKg, loggedAt, note: null };
    set((s) =>
      withStreakCredit({
        ...s,
        weightEntries: [...s.weightEntries, entry],
        user: { ...s.user, currentWeightKg: weightKg, currentWeightUpdatedAt: loggedAt },
      }),
    );
  },

  addPhoto(angle: PhotoAngle, uri: string | number) {
    const photo: ProgressPhoto = {
      id: `photo_${Date.now()}`,
      uri,
      angle,
      weightKgAtCapture: state.user.currentWeightKg,
      capturedAt: new Date().toISOString(),
    };
    set((s) => withStreakCredit({ ...s, photos: [...s.photos, photo] }));
  },

  updateUser(patch: Partial<User>) {
    set((s) => ({ ...s, user: { ...s.user, ...patch } }));
  },

  setTier(tier: Subscription["tier"]) {
    set((s) => ({ ...s, subscription: { ...s.subscription, tier } }));
  },

  useDataset(next: Dataset) {
    dataset = next;
    set(() => datasets[next]());
  },
};
