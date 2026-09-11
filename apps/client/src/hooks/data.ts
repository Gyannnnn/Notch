import { useCallback, useMemo } from "react";

import type {
  FoodItem,
  FoodLog,
  LoggedVia,
  MacroTotals,
  MealSlot,
  PhotoAngle,
  ProgressPhoto,
} from "@/types/domain";
import { daysBetween } from "@/lib/date";
import { pickInsight } from "@/lib/insights";
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

export function useUser() {
  return ready(useMockState(selectUser));
}

export function useSubscription() {
  return ready(useMockState(selectSubscription));
}

export function useStreak() {
  return ready(useMockState(selectStreak));
}

export interface HomeData {
  greetingName: string;
  totals: MacroTotals;
  targets: MacroTotals;
  caloriesLeft: number;
  logs: FoodLog[];
  mealGroups: Record<MealSlot, FoodLog[]>;
  nextSlot: MealSlot | null;
  insight: string;
}

export function useHomeData(): Query<HomeData> {
  const user = useMockState(selectUser);
  const logs = useMockState(selectLogs);

  return ready(
    useMemo(() => {
      const totals = sumLogs(logs);
      const targets: MacroTotals = {
        calories: user.dailyCalorieTarget ?? 0,
        proteinG: user.dailyProteinTargetG ?? 0,
        carbsG: user.dailyCarbsTargetG ?? 0,
        fatG: user.dailyFatTargetG ?? 0,
      };
      return {
        greetingName: user.displayName ?? "there",
        totals,
        targets,
        caloriesLeft: Math.round(targets.calories - totals.calories),
        logs,
        mealGroups: groupByMealSlot(logs),
        nextSlot: nextUnloggedSlot(logs),
        insight: pickInsight({ user, logs, totals }),
      };
    }, [user, logs]),
  );
}

export function useUsuals() {
  return ready(MOCK_USUALS);
}

export type FoodFilter = "all" | "mine" | "presets" | "recent";

export function useFoodSearch(query: string, filter: FoodFilter = "all"): Query<FoodItem[]> {
  const logs = useMockState(selectLogs);

  return ready(
    useMemo(() => {
      const recentIds = new Set(logs.map((l) => l.foodItemId));
      const usualIds = new Set(MOCK_USUALS.map((u) => u.foodItemId));

      const byFilter = FOOD_ITEMS.filter((item) => {
        if (filter === "presets") return item.source === "PRESET";
        if (filter === "recent") return recentIds.has(item.id);
        if (filter === "mine") return usualIds.has(item.id);
        return true;
      });

      const q = query.trim().toLowerCase();
      if (!q) return byFilter;
      return byFilter.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.brandName?.toLowerCase().includes(q) ?? false),
      );
    }, [query, filter, logs]),
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
      const to = sorted[sorted.length - 1]!;
      const targetDays = COMPARISON_RANGE_DAYS[range];

      let from = sorted[0]!;
      if (targetDays !== null) {
        const candidates = sorted.slice(0, -1);
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
    (input: { foodItemId: string; grams: number; mealSlot: MealSlot; loggedVia: LoggedVia }) =>
      actions.logFood(input),
    [],
  );
}

export function useLogWeight() {
  return useCallback((weightKg: number) => actions.logWeight(weightKg), []);
}

export function useAddPhoto() {
  return useCallback((angle: PhotoAngle, uri: string | number) => actions.addPhoto(angle, uri), []);
}

export function useRemoveLog() {
  return useCallback((id: string) => actions.removeLog(id), []);
}
