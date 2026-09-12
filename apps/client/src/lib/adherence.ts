import type { FoodLog } from "@/types/domain";
import { localDateKey } from "./date";
import { sumLogs } from "./macros";

export type AdherenceState = "on-track" | "over" | "under" | "empty";

export interface AdherenceDay {
  dateKey: string;
  calories: number;
  target: number;
  state: AdherenceState;
}

/**
 * How wide "on track" is, as a fraction of the target either side. A day is
 * not a pass/fail test — normal eating varies, and a band this tight would
 * mark almost every real day as a miss (PRD 10.3).
 */
const BAND = 0.1;

export function adherenceState(calories: number, target: number, hasLogs: boolean): AdherenceState {
  if (!hasLogs || target <= 0) return "empty";
  if (calories > target * (1 + BAND)) return "over";
  if (calories < target * (1 - BAND)) return "under";
  return "on-track";
}

export function logsForDate(logs: FoodLog[], dateKey: string): FoodLog[] {
  return logs.filter((log) => localDateKey(log.loggedAt) === dateKey);
}

/** One entry per requested day, oldest first, whether or not it has logs. */
export function adherenceForDays(
  logs: FoodLog[],
  target: number,
  dateKeys: string[],
): AdherenceDay[] {
  const byDate = new Map<string, FoodLog[]>();
  for (const log of logs) {
    const key = localDateKey(log.loggedAt);
    const bucket = byDate.get(key);
    if (bucket) bucket.push(log);
    else byDate.set(key, [log]);
  }

  return dateKeys.map((dateKey) => {
    const dayLogs = byDate.get(dateKey) ?? [];
    const calories = Math.round(sumLogs(dayLogs).calories);
    return {
      dateKey,
      calories,
      target,
      state: adherenceState(calories, target, dayLogs.length > 0),
    };
  });
}
