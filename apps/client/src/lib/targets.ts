import type { ActivityLevel, Goal, User } from "@/types/domain";

/**
 * Daily calorie and macro targets, derived from the five things onboarding
 * asks for (PRD 6.4).
 *
 * Deliberately *not* Mifflin-St Jeor or Harris-Benedict: both need age and sex,
 * which this product never asks for and should not start asking for to feed a
 * formula whose output is an estimate either way. The bodyweight-multiplier
 * model below needs only what the user has already given us, and lands within
 * a few percent of the equations it replaces for the range of adults this app
 * is for. Every number here is a starting point the user can override — see
 * `targetsCustom` on User.
 */

/** Maintenance kcal per kg of bodyweight per day, by how the week actually looks. */
const KCAL_PER_KG: Record<ActivityLevel, number> = {
  SEDENTARY: 26,
  LIGHT: 29,
  MODERATE: 32,
  ACTIVE: 35,
  VERY_ACTIVE: 38,
};

/**
 * Applied to maintenance. The cut is held at -20% rather than anything
 * steeper: PRD 6.3 treats losing too fast as a failure state, not a win, so
 * the default must not put a user in the band the pace indicator will warn
 * them about.
 */
const GOAL_ADJUSTMENT: Record<Goal, number> = {
  CUT: -0.2,
  BULK: 0.1,
  MAINTAIN: 0,
};

/** Protein g per kg. Highest on a cut, where muscle loss is the actual risk. */
const PROTEIN_G_PER_KG: Record<Goal, number> = {
  CUT: 2.2,
  BULK: 1.8,
  MAINTAIN: 2.0,
};

/** Share of calories from fat; the rest, after protein, goes to carbs. */
const FAT_SHARE = 0.25;

/**
 * A floor the derived target will not go under, whatever the arithmetic says.
 * A light, sedentary user on a cut computes to around 1250 kcal, and anything
 * below roughly this is a target no app should hand someone unprompted. If a
 * user genuinely wants to go lower they can set it themselves, which is a
 * deliberate decision rather than a default we chose for them.
 */
const MIN_CALORIES = 1200;

export interface DailyTargets {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface TargetInputs {
  goal: Goal | null;
  weightKg: number | null;
  activityLevel: ActivityLevel | null;
}

/** Maintenance calories before the goal adjustment — shown as the "from" number. */
export function maintenanceCalories(inputs: TargetInputs): number | null {
  const { weightKg, activityLevel } = inputs;
  if (activityLevel === null || weightKg === null || weightKg <= 0) return null;
  return Math.round((weightKg * KCAL_PER_KG[activityLevel]) / 10) * 10;
}

/**
 * Null when onboarding has not collected enough to say anything honest. A
 * caller that gets null should leave whatever targets already exist alone.
 */
export function deriveTargets(inputs: TargetInputs): DailyTargets | null {
  const { goal, weightKg, activityLevel } = inputs;
  if (goal === null || activityLevel === null || weightKg === null || weightKg <= 0) return null;

  const maintenance = weightKg * KCAL_PER_KG[activityLevel];
  // Rounded to 10 kcal. A target of 2183 implies a precision the inputs do not
  // have, and invites users to chase a number that is an estimate anyway.
  const calories = Math.max(
    MIN_CALORIES,
    Math.round((maintenance * (1 + GOAL_ADJUSTMENT[goal])) / 10) * 10,
  );

  const proteinG = Math.round(weightKg * PROTEIN_G_PER_KG[goal]);
  const fatG = Math.round((calories * FAT_SHARE) / 9);
  // Carbs take the remainder so the three macros always add back to the
  // calorie target, rather than each being rounded independently.
  const carbsG = Math.max(0, Math.round((calories - proteinG * 4 - fatG * 9) / 4));

  return { calories, proteinG, carbsG, fatG };
}

type TargetUser = Pick<User, "goal" | "activityLevel" | "currentWeightKg" | "startingWeightKg">;

export const targetInputsFor = (user: TargetUser): TargetInputs => ({
  goal: user.goal,
  activityLevel: user.activityLevel,
  weightKg: user.currentWeightKg ?? user.startingWeightKg,
});

export const targetsForUser = (user: TargetUser) => deriveTargets(targetInputsFor(user));
