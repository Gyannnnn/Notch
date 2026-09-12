import type { ActivityLevel, Goal } from "@/types/domain";

export interface ChoiceOption<T extends string> {
  value: T;
  title: string;
  body: string;
}

/** Cut / Bulk / Maintain, worded as a choice. Onboarding and profile editing
 *  ask the same question, so they must offer the same words. */
export const GOAL_OPTIONS: ChoiceOption<Goal>[] = [
  { value: "CUT", title: "Cut", body: "Lose fat, hold on to muscle" },
  { value: "BULK", title: "Bulk", body: "Build muscle, accept some gain" },
  { value: "MAINTAIN", title: "Maintain", body: "Stay where you are" },
];

export const ACTIVITY_OPTIONS: ChoiceOption<ActivityLevel>[] = [
  { value: "SEDENTARY", title: "Sedentary", body: "Desk job, little movement" },
  { value: "LIGHT", title: "Lightly active", body: "Some walking, 1–2 sessions a week" },
  { value: "MODERATE", title: "Moderately active", body: "Training 3–4 times a week" },
  { value: "ACTIVE", title: "Active", body: "Training 5–6 times a week" },
  { value: "VERY_ACTIVE", title: "Very active", body: "Daily training or physical work" },
];

/**
 * The continuous form, for where the goal is reported as a state the user is
 * already in ("Cutting") rather than offered as a choice ("Cut").
 */
export const GOAL_STATUS_LABELS: Record<Goal, string> = {
  CUT: "Cutting",
  BULK: "Bulking",
  MAINTAIN: "Maintaining",
};

export const ACTIVITY_LABELS = Object.fromEntries(
  ACTIVITY_OPTIONS.map((option) => [option.value, option.title]),
) as Record<ActivityLevel, string>;
