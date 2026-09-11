import type { FoodItem, FoodLog, MacroTotals, MealSlot } from "@/types/domain";
import { MEAL_SLOTS } from "@/types/domain";

export const EMPTY_TOTALS: MacroTotals = { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 };

export function sumLogs(logs: FoodLog[]): MacroTotals {
  return logs.reduce<MacroTotals>(
    (acc, log) => ({
      calories: acc.calories + log.caloriesLogged,
      proteinG: acc.proteinG + log.proteinLoggedG,
      carbsG: acc.carbsG + log.carbsLoggedG,
      fatG: acc.fatG + log.fatLoggedG,
    }),
    EMPTY_TOTALS,
  );
}

export function groupByMealSlot(logs: FoodLog[]): Record<MealSlot, FoodLog[]> {
  const grouped = Object.fromEntries(MEAL_SLOTS.map((slot) => [slot, [] as FoodLog[]])) as Record<
    MealSlot,
    FoodLog[]
  >;
  for (const log of logs) grouped[log.mealSlot].push(log);
  return grouped;
}

/** The slot a "+ Add" prompt should point at: the first one with nothing in it. */
export function nextUnloggedSlot(logs: FoodLog[]): MealSlot | null {
  const grouped = groupByMealSlot(logs);
  return MEAL_SLOTS.find((slot) => grouped[slot].length === 0) ?? null;
}

/** Macros for an arbitrary portion of a food, rounded the way we display them. */
export function macrosForPortion(item: FoodItem, grams: number) {
  const ratio = grams / 100;
  return {
    caloriesLogged: Math.round(item.caloriesPer100g * ratio),
    proteinLoggedG: Math.round(item.proteinPer100g * ratio),
    carbsLoggedG: Math.round(item.carbsPer100g * ratio),
    fatLoggedG: Math.round(item.fatPer100g * ratio),
  };
}

export const remaining = (target: number, consumed: number) => Math.max(0, target - consumed);

/** Uncapped, so a ring can show a second lap when a user goes over target. */
export const progress = (consumed: number, target: number) => (target > 0 ? consumed / target : 0);

export const MACRO_KEYS = ["protein", "carbs", "fat"] as const;
export type MacroKey = (typeof MACRO_KEYS)[number];

export const MACRO_LABELS: Record<MacroKey, string> = {
  protein: "Protein",
  carbs: "Carbs",
  fat: "Fat",
};

export function macroValues(totals: MacroTotals): Record<MacroKey, number> {
  return { protein: totals.proteinG, carbs: totals.carbsG, fat: totals.fatG };
}
