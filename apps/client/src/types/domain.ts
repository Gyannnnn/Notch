/**
 * Mirrors apps/api/prisma/schema.prisma. Enum members and field names match the
 * database exactly, and dates are ISO strings because that is what the API will
 * send over the wire — so swapping mock hooks for real requests is a wire-up,
 * not a reshape.
 */

export type Goal = "CUT" | "BULK" | "MAINTAIN";
export type ActivityLevel = "SEDENTARY" | "LIGHT" | "MODERATE" | "ACTIVE" | "VERY_ACTIVE";
export type MealSlot = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
export type PhotoAngle = "FRONT" | "SIDE" | "BACK";
export type FoodSource = "BARCODE" | "PRESET" | "MANUAL" | "AI_ASSIST";
export type LoggedVia =
  | "BARCODE_SCAN"
  | "PRESET_TAP"
  | "MANUAL_ENTRY"
  | "AI_ASSIST"
  | "USUAL_REPEAT";
export type SubscriptionTier = "FREE" | "PRO";
export type Region = "IN" | "US" | "OTHER";

export const MEAL_SLOTS: MealSlot[] = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];
export const PHOTO_ANGLES: PhotoAngle[] = ["FRONT", "SIDE", "BACK"];

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  region: Region;
  timezone: string | null;
  goal: Goal | null;
  heightCm: number | null;
  startingWeightKg: number | null;
  targetWeightKg: number | null;
  activityLevel: ActivityLevel | null;
  currentWeightKg: number | null;
  currentWeightUpdatedAt: string | null;
  dailyCalorieTarget: number | null;
  dailyProteinTargetG: number | null;
  dailyCarbsTargetG: number | null;
  dailyFatTargetG: number | null;
  /** True once the user has typed their own targets, which stops the derived
   *  ones from overwriting them when weight or activity changes. */
  targetsCustom: boolean;
  onboardingComplete: boolean;
}

export interface WeightEntry {
  id: string;
  weightKg: number;
  loggedAt: string;
  note: string | null;
}

export interface ProgressPhoto {
  id: string;
  /** Local require() id or remote URI. Real data returns a signed R2 URL here. */
  uri: string | number;
  angle: PhotoAngle;
  weightKgAtCapture: number | null;
  capturedAt: string;
}

export interface FoodItem {
  id: string;
  source: FoodSource;
  name: string;
  brandName: string | null;
  presetSlug: string | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  servingSizeG: number | null;
  /** Real-world portion this food is normally eaten in, e.g. "1 katori". */
  portionLabel: string | null;
  verifiedSource: boolean;
}

/** Macros are snapshotted at log time, exactly as the FoodLog table stores them. */
export interface FoodLog {
  id: string;
  foodItemId: string | null;
  name: string;
  portionGrams: number;
  portionLabel: string | null;
  caloriesLogged: number;
  proteinLoggedG: number;
  carbsLoggedG: number;
  fatLoggedG: number;
  mealSlot: MealSlot;
  loggedVia: LoggedVia;
  loggedAt: string;
}

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  freezesRemaining: number;
  freezesResetAt: string;
  lastActiveLocalDate: string;
  /** Local dates that had a qualifying log, for the streak heatmap. */
  activeDates: string[];
  /** Local dates covered by a freeze rather than a log. */
  frozenDates: string[];
}

export interface Subscription {
  tier: SubscriptionTier;
  currentPeriodEnd: string | null;
}

export interface UsualMeal {
  foodItemId: string;
  name: string;
  portionLabel: string | null;
  portionGrams: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  mealSlot: MealSlot;
  timesLogged: number;
}

export interface MacroTotals {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

/**
 * Reminder settings. Behaviourally-timed delivery (PRD 6.8) is a server
 * concern — what the user controls here is which reminders exist at all and
 * the window they're allowed to arrive in.
 */
export interface NotificationPrefs {
  mealReminders: boolean;
  weighInReminder: boolean;
  streakMilestones: boolean;
  /** Hours, 0–23. Nothing is delivered between these two. */
  quietHoursStart: number;
  quietHoursEnd: number;
}

export interface PrivacyPrefs {
  photosPrivateByDefault: boolean;
  shareIncludesStats: boolean;
  analyticsOptOut: boolean;
}
