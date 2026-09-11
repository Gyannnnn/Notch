import type { Goal, WeightEntry } from "@/types/domain";
import { daysBetween } from "./date";

export type TrendRange = "week" | "month" | "all";

export const TREND_RANGE_DAYS: Record<TrendRange, number | null> = {
  week: 7,
  month: 30,
  all: null,
};

export interface SmoothedPoint {
  date: string;
  raw: number;
  average: number;
}

/**
 * Rolling average over a trailing window. The trend line plots this rather than
 * raw weights, so normal day-to-day water fluctuation doesn't read as progress
 * or failure (PRD 6.3).
 */
export function rollingAverage(entries: WeightEntry[], windowDays = 7): SmoothedPoint[] {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime(),
  );

  return sorted.map((entry, i) => {
    const window = sorted
      .slice(0, i + 1)
      .filter((e) => daysBetween(e.loggedAt, entry.loggedAt) < windowDays);
    const average = window.reduce((sum, e) => sum + e.weightKg, 0) / window.length;
    return { date: entry.loggedAt, raw: entry.weightKg, average };
  });
}

export function entriesInRange(entries: WeightEntry[], range: TrendRange): WeightEntry[] {
  const days = TREND_RANGE_DAYS[range];
  if (days === null) return entries;
  const now = new Date();
  return entries.filter((e) => daysBetween(e.loggedAt, now) <= days);
}

export type PaceState = "ON_PACE" | "FASTER" | "SLOWER" | "INSUFFICIENT";

export interface Pace {
  state: PaceState;
  kgPerWeek: number;
  label: string;
}

/**
 * Healthy rates of change, in kg/week. A cut outside this band risks muscle
 * loss; a bulk outside it is mostly fat gain.
 */
const TARGET_BAND: Record<Goal, { min: number; max: number }> = {
  CUT: { min: -1.0, max: -0.25 },
  BULK: { min: 0.15, max: 0.5 },
  MAINTAIN: { min: -0.2, max: 0.2 },
};

/**
 * Compares the rolling average's rate of change against the band for the user's
 * goal. Labels describe the rate, never the person — there is no "behind" or
 * "failing" state here by design.
 */
export function computePace(entries: WeightEntry[], goal: Goal | null): Pace {
  const smoothed = rollingAverage(entries);
  const first = smoothed[0];
  const last = smoothed[smoothed.length - 1];

  if (!goal || smoothed.length < 2 || !first || !last) {
    return { state: "INSUFFICIENT", kgPerWeek: 0, label: "Not enough data yet" };
  }

  const days = daysBetween(first.date, last.date);
  if (days < 7) {
    return { state: "INSUFFICIENT", kgPerWeek: 0, label: "Keep logging to see your pace" };
  }

  const kgPerWeek = ((last.average - first.average) / days) * 7;
  const band = TARGET_BAND[goal];

  if (kgPerWeek >= band.min && kgPerWeek <= band.max) {
    return { state: "ON_PACE", kgPerWeek, label: "On pace" };
  }

  const movingFasterThanBand = goal === "CUT" ? kgPerWeek < band.min : kgPerWeek > band.max;
  return movingFasterThanBand
    ? { state: "FASTER", kgPerWeek, label: "Faster than planned" }
    : { state: "SLOWER", kgPerWeek, label: "Slower than planned" };
}
