import { useCallback, useMemo } from "react";

import type {
  FoodItem,
  FoodLog,
  LoggedVia,
  MacroTotals,
  MealSlot,
  NotificationPrefs,
  PhotoAngle,
  PrivacyPrefs,
  ProgressPhoto,
  User,
} from "@/types/domain";
import { PHOTO_ANGLES } from "@/types/domain";
import { adherenceForDays, adherenceState, logsForDate, type AdherenceDay } from "@/lib/adherence";
import { daysBetween, localDateKey, recentWeekDateKeys } from "@/lib/date";
import { dayRecap, pickInsight } from "@/lib/insights";
import { groupByMealSlot, nextUnloggedSlot, sumLogs } from "@/lib/macros";
import { computePace, entriesInRange, rollingAverage, type TrendRange } from "@/lib/weightTrend";
import { FOOD_ITEMS } from "@/mocks/foods";
import { MOCK_USUALS } from "@/mocks/fixtures";
import { actions, useMockState, type MockState } from "@/mocks/store";

/**
 * Mirrors TanStack Query's result shape. Swapping these hooks for real requests
 * means changing what is inside them, not the screens that call them.
  */
export interface Query<T> {
  data: T;
  isLoading: boolean;
  error: Error | null;
}

const ready = <T,>(data: T): Query<T> => ({ data, isLoading: false, error: null });

// Selectors return existing references from the store. useSyncExternalStore
// requires a stable snapshot, so derived objects are built with useMemo below
// rather than inside a selector.
const selectUser = (s: MockState) => s.user;
const selectLogs = (s: MockState) => s.logs;
const selectWeights = (s: MockState) => s.weightEntries;
const selectPhotos = (s: MockState) => s.photos;
const selectStreak = (s: MockState) => s.streak;
const selectSubscription = (s: MockState) => s.subscription;
const selectCustomFoods = (s: MockState) => s.customFoods;
const selectNotifications = (s: MockState) => s.notifications;
const selectPrivacy = (s: MockState) => s.privacy;

export function useUser() {
  return ready(useMockState(selectUser));
}

export function useSubscription() {
  return ready(useMockState(selectSubscription));
}

export function useStreak() {
  return ready(useMockState(selectStreak));
}

export function useNotificationPrefs() {
  return ready(useMockState(selectNotifications));
}

export function usePrivacyPrefs() {
  return ready(useMockState(selectPrivacy));
}

function targetsFor(user: User): MacroTotals {
  return {
    calories: user.dailyCalorieTarget ?? 0,
    proteinG: user.dailyProteinTargetG ?? 0,
    carbsG: user.dailyCarbsTargetG ?? 0,
    fatG: user.dailyFatTargetG ?? 0,
  };
}

export interface HomeData {
  dateKey: string;
  isToday: boolean;
  greetingName: string;
  totals: MacroTotals;
  targets: MacroTotals;
  caloriesLeft: number;
  logs: FoodLog[];
  mealGroups: Record<MealSlot, FoodLog[]>;
  nextSlot: MealSlot | null;
  /** One calm line: a live prompt for today, a retrospective for a past day. */
  insight: string;
}

/**
 * Scoped to a single calendar day. The store holds every log the account has,
 * so the day being read is a parameter rather than an assumption — which is
 * also what lets Home page back through history.
 */
export function useHomeData(dateKey: string = localDateKey()): Query<HomeData> {
  const user = useMockState(selectUser);
  const allLogs = useMockState(selectLogs);

  return ready(
    useMemo(() => {
      const logs = logsForDate(allLogs, dateKey);
      const isToday = dateKey === localDateKey();
      const totals = sumLogs(logs);
      const targets = targetsFor(user);

      return {
        dateKey,
        isToday,
        greetingName: user.displayName ?? "there",
        totals,
        targets,
        caloriesLeft: Math.round(targets.calories - totals.calories),
        logs,
        mealGroups: groupByMealSlot(logs),
        nextSlot: nextUnloggedSlot(logs),
        insight: isToday
          ? pickInsight({ user, logs, totals })
          : dayRecap({
              logs,
              totals,
              target: targets.calories,
              state: adherenceState(totals.calories, targets.calories, logs.length > 0),
            }),
      };
    }, [user, allLogs, dateKey]),
  );
}

/** A single log, for the edit screen. */
export function useFoodLog(id: string | undefined): Query<FoodLog | null> {
  const logs = useMockState(selectLogs);
  return ready(useMemo(() => logs.find((log) => log.id === id) ?? null, [logs, id]));
}

/** How each day of the last `weeks` weeks landed against target, oldest first. */
export function useAdherence(weeks = 4): Query<AdherenceDay[]> {
  const user = useMockState(selectUser);
  const logs = useMockState(selectLogs);

  return ready(
    useMemo(
      () => adherenceForDays(logs, user.dailyCalorieTarget ?? 0, recentWeekDateKeys(weeks)),
      [logs, user.dailyCalorieTarget, weeks],
    ),
  );
}

export interface ExportSummary {
  email: string;
  foodLogs: number;
  weighIns: number;
  photos: number;
  /** Date key of the earliest record of any kind, or null on a new account. */
  since: string | null;
}

/** What an export would contain, so the screen can state it rather than promise it. */
export function useExportSummary(): Query<ExportSummary> {
  const user = useMockState(selectUser);
  const logs = useMockState(selectLogs);
  const weights = useMockState(selectWeights);
  const photos = useMockState(selectPhotos);

  return ready(
    useMemo(() => {
      const timestamps = [
        ...logs.map((l) => l.loggedAt),
        ...weights.map((w) => w.loggedAt),
        ...photos.map((p) => p.capturedAt),
      ];
      const earliest = timestamps.reduce<string | null>(
        (oldest, at) => (oldest === null || at < oldest ? at : oldest),
        null,
      );

      return {
        email: user.email,
        foodLogs: logs.length,
        weighIns: weights.length,
        photos: photos.length,
        since: earliest === null ? null : localDateKey(earliest),
      };
    }, [user.email, logs, weights, photos]),
  );
}

export function useUsuals() {
  return ready(MOCK_USUALS);
}

export type FoodFilter = "all" | "mine" | "presets" | "recent";

export function useFoodSearch(query: string, filter: FoodFilter = "all"): Query<FoodItem[]> {
  const logs = useMockState(selectLogs);
  const customFoods = useMockState(selectCustomFoods);

  return ready(
    useMemo(() => {
      const recentIds = new Set(logs.map((l) => l.foodItemId));

      // Foods the user typed in themselves lead the catalog: they were added
      // because nothing in it matched.
      const byFilter = [...customFoods, ...FOOD_ITEMS].filter((item) => {
        if (filter === "presets") return item.source === "PRESET";
        if (filter === "recent") return recentIds.has(item.id);
        if (filter === "mine") return item.source === "MANUAL";
        return true;
      });

      const q = query.trim().toLowerCase();
      if (!q) return byFilter;
      return byFilter.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.brandName?.toLowerCase().includes(q) ?? false),
      );
    }, [query, filter, logs, customFoods]),
  );
}

export interface WeightTrend {
  points: { date: string; raw: number; average: number }[];
  latestKg: number | null;
  deltaKg: number;
  pace: ReturnType<typeof computePace>;
}

export function useWeightTrend(range: TrendRange = "month"): Query<WeightTrend> {
  const user = useMockState(selectUser);
  const entries = useMockState(selectWeights);

  return ready(
    useMemo(() => {
      const inRange = entriesInRange(entries, range);
      const points = rollingAverage(inRange);
      const first = points[0];
      const last = points[points.length - 1];
      return {
        points,
        latestKg: last?.raw ?? null,
        deltaKg: first && last ? last.average - first.average : 0,
        pace: computePace(entries, user.goal),
      };
    }, [entries, range, user.goal]),
  );
}

export function usePhotos() {
  return ready(useMockState(selectPhotos));
}

export function usePhoto(id: string | undefined): Query<ProgressPhoto | null> {
  const photos = useMockState(selectPhotos);
  return ready(useMemo(() => photos.find((photo) => photo.id === id) ?? null, [photos, id]));
}

export interface PhotoSlide {
  angle: PhotoAngle;
  /** null where that angle was never shot on this day — an empty slot, not a gap. */
  photo: ProgressPhoto | null;
}

export interface PhotoSession {
  /** Local day key. One session per day. */
  key: string;
  capturedAt: string;
  photos: ProgressPhoto[];
  /** Always in PHOTO_ANGLES order, so slide N is the same angle on every day. */
  slides: PhotoSlide[];
  /** The frame the gallery shows for the day. */
  cover: ProgressPhoto;
  weightKgAtCapture: number | null;
}

/**
 * A day's shoot rather than a single frame. Front/side/back taken the same day
 * are one thing the user swipes across, and both the gallery tile and the
 * detail pager have to agree on that — group it once here, or the grid and the
 * pager end up with different numbers of entries and scrolling the pager lands
 * somewhere the grid never showed.
 *
 * Newest day first, matching the gallery's feed order.
 */
export function usePhotoSessions(): Query<PhotoSession[]> {
  const photos = useMockState(selectPhotos);

  return ready(
    useMemo(() => {
      const byDay = new Map<string, ProgressPhoto[]>();
      for (const photo of photos) {
        const key = localDateKey(photo.capturedAt);
        const bucket = byDay.get(key);
        if (bucket) bucket.push(photo);
        else byDay.set(key, [photo]);
      }

      const sessions: PhotoSession[] = [];
      for (const [key, taken] of byDay) {
        // Every angle gets a slide. Shooting the same angle twice in a day adds
        // slides rather than replacing one, so no frame becomes unreachable —
        // and therefore undeletable — just because it shares an angle.
        const slides: PhotoSlide[] = PHOTO_ANGLES.flatMap((angle): PhotoSlide[] => {
          const forAngle = taken
            .filter((photo) => photo.angle === angle)
            .sort((a, b) => a.capturedAt.localeCompare(b.capturedAt));
          return forAngle.length > 0
            ? forAngle.map((photo) => ({ angle, photo }))
            : [{ angle, photo: null }];
        });

        const ordered = slides.flatMap((slide) => (slide.photo ? [slide.photo] : []));
        const cover = ordered[0];
        if (!cover) continue;

        sessions.push({
          key,
          capturedAt: cover.capturedAt,
          photos: ordered,
          slides,
          cover,
          weightKgAtCapture:
            ordered.find((photo) => photo.weightKgAtCapture !== null)?.weightKgAtCapture ?? null,
        });
      }

      return sessions.sort((a, b) => b.key.localeCompare(a.key));
    }, [photos]),
  );
}

export type ComparisonRange = "2w" | "1m" | "oldest";

export const COMPARISON_RANGE_DAYS: Record<ComparisonRange, number | null> = {
  "2w": 14,
  "1m": 30,
  oldest: null,
};

export interface Comparison {
  from: ProgressPhoto;
  to: ProgressPhoto;
  days: number;
  weightDeltaKg: number | null;
}

/**
 * Picks the best available pair for a range without asking the user to search —
 * the "within 2 taps, no manual file search" requirement in PRD 6.1.
 */
export function useComparison(range: ComparisonRange = "1m"): Query<Comparison | null> {
  const photos = useMockState(selectPhotos);

  return ready(
    useMemo(() => {
      if (photos.length < 2) return null;

      const sorted = [...photos].sort(
        (a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime(),
      );

      // Wiping a front shot into a side one shows a change the body never made,
      // so a comparison only ever pairs frames of the same angle. The angle with
      // the most frames wins, ties going to the earliest in PHOTO_ANGLES order
      // (front), which is both the deliberate default and the one users shoot.
      const series = PHOTO_ANGLES.map((angle) =>
        sorted.filter((photo) => photo.angle === angle),
      ).reduce((best, group) => (group.length > best.length ? group : best), [] as ProgressPhoto[]);
      if (series.length < 2) return null;

      const to = series[series.length - 1]!;
      const targetDays = COMPARISON_RANGE_DAYS[range];

      let from = series[0]!;
      if (targetDays !== null) {
        const candidates = series.slice(0, -1);
        from = candidates.reduce((best, photo) => {
          const bestGap = Math.abs(daysBetween(best.capturedAt, to.capturedAt) - targetDays);
          const gap = Math.abs(daysBetween(photo.capturedAt, to.capturedAt) - targetDays);
          return gap < bestGap ? photo : best;
        }, candidates[0]!);
      }

      const weightDeltaKg =
        from.weightKgAtCapture !== null && to.weightKgAtCapture !== null
          ? to.weightKgAtCapture - from.weightKgAtCapture
          : null;

      return { from, to, days: daysBetween(from.capturedAt, to.capturedAt), weightDeltaKg };
    }, [photos, range]),
  );
}

export function useLogFood() {
  return useCallback(
    (input: {
      foodItemId: string;
      grams: number;
      mealSlot: MealSlot;
      loggedVia: LoggedVia;
      dateKey?: string;
    }) => actions.logFood(input),
    [],
  );
}

export function useUpdateLog() {
  return useCallback(
    (id: string, patch: { portionGrams?: number; mealSlot?: MealSlot }) =>
      actions.updateLog(id, patch),
    [],
  );
}

export function useRemoveLog() {
  return useCallback((id: string) => actions.removeLog(id), []);
}

export function useCreateManualFood() {
  return useCallback(
    (input: Parameters<typeof actions.createManualFood>[0]) => actions.createManualFood(input),
    [],
  );
}

export function useLogWeight() {
  return useCallback((weightKg: number) => actions.logWeight(weightKg), []);
}

export function useAddPhoto() {
  return useCallback((angle: PhotoAngle, uri: string | number) => actions.addPhoto(angle, uri), []);
}

export function useRemovePhoto() {
  return useCallback((id: string) => actions.removePhoto(id), []);
}

export function useUpdateUser() {
  return useCallback((patch: Partial<User>) => actions.updateUser(patch), []);
}

export function useUpdateNotifications() {
  return useCallback(
    (patch: Partial<NotificationPrefs>) => actions.updateNotifications(patch),
    [],
  );
}

export function useUpdatePrivacy() {
  return useCallback((patch: Partial<PrivacyPrefs>) => actions.updatePrivacy(patch), []);
}

export function useDeleteAccount() {
  return useCallback(() => actions.deleteAccount(), []);
}
