import type { FoodLog, MacroTotals, MealSlot, User } from "@/types/domain";
import type { AdherenceState } from "./adherence";
import { nextUnloggedSlot } from "./macros";

const SLOT_LABELS: Record<MealSlot, string> = {
  BREAKFAST: "breakfast",
  LUNCH: "lunch",
  DINNER: "dinner",
  SNACK: "a snack",
};

interface InsightInput {
  user: User;
  logs: FoodLog[];
  totals: MacroTotals;
  hour?: number;
}

/**
 * Picks one calm sentence driven by the day's actual numbers. Rules are ordered
 * by usefulness and the first match wins, so only one thing is ever surfaced.
 *
 * Every string here is deliberately non-urgent and non-corrective: no
 * exclamation marks, no imperatives, and nothing that frames an unlogged meal
 * or an over-target day as a failure (PRD 10.3).
 */
export function pickInsight({ user, logs, totals, hour = new Date().getHours() }: InsightInput) {
  const proteinTarget = user.dailyProteinTargetG ?? 0;
  const calorieTarget = user.dailyCalorieTarget ?? 0;
  const proteinLeft = Math.round(proteinTarget - totals.proteinG);
  const caloriesLeft = Math.round(calorieTarget - totals.calories);
  const pendingSlot = nextUnloggedSlot(logs);

  if (logs.length === 0) {
    return "Nothing logged yet today. Your usuals are one tap away.";
  }

  if (caloriesLeft < 0) {
    return `You're ${Math.abs(caloriesLeft)} kcal past target today. Worth noting, not worth stressing.`;
  }

  if (proteinTarget > 0 && proteinLeft > 20 && pendingSlot) {
    return `About ${proteinLeft}g of protein to go, with ${SLOT_LABELS[pendingSlot]} still to log.`;
  }

  if (proteinTarget > 0 && proteinLeft <= 0) {
    return "Protein target met for the day.";
  }

  if (!pendingSlot && caloriesLeft > 0) {
    return `All meals logged, ${caloriesLeft} kcal still available.`;
  }

  if (hour >= 20 && caloriesLeft > 300) {
    return `You're tracking ${caloriesLeft} kcal under target today.`;
  }

  return `${caloriesLeft} kcal left, and you're on track for the day.`;
}

interface RecapInput {
  logs: FoodLog[];
  totals: MacroTotals;
  target: number;
  state: AdherenceState;
}

/**
 * The past-day counterpart to `pickInsight`. A finished day can't be acted on,
 * so this states what happened and stops — no "you should have", and an
 * unlogged day is described as absent data rather than a lapse (PRD 10.3).
 */
export function dayRecap({ logs, totals, target, state }: RecapInput): string {
  if (state === "empty" || logs.length === 0) {
    return "Nothing logged on this day.";
  }

  const diff = Math.round(totals.calories - target);
  if (state === "over") return `${diff} kcal over target, across ${mealCount(logs)}.`;
  if (state === "under") return `${Math.abs(diff)} kcal under target, across ${mealCount(logs)}.`;
  return `Within your target range, across ${mealCount(logs)}.`;
}

function mealCount(logs: FoodLog[]): string {
  const slots = new Set(logs.map((log) => log.mealSlot)).size;
  return `${slots} ${slots === 1 ? "meal" : "meals"}`;
}
