import type {
  FoodLog,
  NotificationPrefs,
  PrivacyPrefs,
  ProgressPhoto,
  StreakState,
  Subscription,
  UsualMeal,
  User,
  WeightEntry,
} from "@/types/domain";
import { addDays, localDateKey } from "@/lib/date";
import { macrosForPortion } from "@/lib/macros";
import { targetsForUser } from "@/lib/targets";
import { foodById } from "./foods";

/** Everything is generated relative to now, so the app never looks stale. */
const now = new Date();
const iso = (daysAgo: number, hour = 9, minute = 0) => {
  const d = addDays(now, -daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

/** Everything about a user except the targets, which are computed from it. */
type UserProfile = Omit<
  User,
  "dailyCalorieTarget" | "dailyProteinTargetG" | "dailyCarbsTargetG" | "dailyFatTargetG"
>;

const MOCK_PROFILE = {
  id: "user_mock",
  email: "you@example.com",
  displayName: "Arjun",
  region: "IN",
  timezone: "Asia/Kolkata",
  goal: "CUT",
  heightCm: 178,
  startingWeightKg: 82.4,
  targetWeightKg: 74,
  activityLevel: "ACTIVE",
  currentWeightKg: 77.9,
  currentWeightUpdatedAt: iso(0, 7, 30),
  targetsCustom: false,
  onboardingComplete: true,
} satisfies UserProfile;

/**
 * Derived rather than hand-written, so the fixture can never claim a target
 * the app would not actually calculate for this profile.
 */
const withTargets = (profile: UserProfile): User => {
  const targets = targetsForUser(profile);
  return {
    ...profile,
    dailyCalorieTarget: targets?.calories ?? null,
    dailyProteinTargetG: targets?.proteinG ?? null,
    dailyCarbsTargetG: targets?.carbsG ?? null,
    dailyFatTargetG: targets?.fatG ?? null,
  };
};

export const MOCK_USER: User = withTargets(MOCK_PROFILE);

/** 84 days trending down with day-to-day noise, so the rolling average earns its place. */
export const MOCK_WEIGHT_ENTRIES: WeightEntry[] = Array.from({ length: 84 }, (_, i) => {
  const daysAgo = 83 - i;
  const trend = 82.4 - i * 0.054;
  const waterWeightNoise = Math.sin(i * 1.7) * 0.42 + Math.cos(i * 0.6) * 0.24;
  return {
    id: `weight_${i}`,
    weightKg: Math.round((trend + waterWeightNoise) * 10) / 10,
    loggedAt: iso(daysAgo, 7, 30),
    note: null,
  };
});

const log = (
  id: string,
  foodItemId: string,
  grams: number,
  mealSlot: FoodLog["mealSlot"],
  loggedVia: FoodLog["loggedVia"],
  hour: number,
  daysAgo = 0,
): FoodLog => {
  const item = foodById(foodItemId)!;
  return {
    id,
    foodItemId,
    name: item.name,
    portionGrams: grams,
    portionLabel: item.portionLabel,
    ...macrosForPortion(item, grams),
    mealSlot,
    loggedVia,
    loggedAt: iso(daysAgo, hour),
  };
};

type LogTemplate = [
  foodItemId: string,
  grams: number,
  mealSlot: FoodLog["mealSlot"],
  loggedVia: FoodLog["loggedVia"],
  hour: number,
];

/**
 * Today stops after the afternoon shake on purpose: dinner stays unlogged so
 * Home always has a live "next meal" prompt and a calorie gap worth filling.
 */
const TODAY: LogTemplate[] = [
  ["poha", 180, "BREAKFAST", "USUAL_REPEAT", 8],
  ["egg-boiled", 100, "BREAKFAST", "PRESET_TAP", 8],
  ["rice-basmati", 150, "LUNCH", "PRESET_TAP", 13],
  ["dal-tadka", 150, "LUNCH", "PRESET_TAP", 13],
  ["bhindi-masala", 130, "LUNCH", "PRESET_TAP", 13],
  ["whey-scoop", 30, "SNACK", "BARCODE_SCAN", 17],
];

/** A day eaten through to dinner, ~2050 kcal before the per-day scaling below. */
const FULL_DAY: LogTemplate[] = [
  ["poha", 200, "BREAKFAST", "USUAL_REPEAT", 8],
  ["egg-boiled", 100, "BREAKFAST", "PRESET_TAP", 8],
  ["banana", 118, "BREAKFAST", "PRESET_TAP", 8],
  ["rice-basmati", 200, "LUNCH", "PRESET_TAP", 13],
  ["dal-tadka", 180, "LUNCH", "PRESET_TAP", 13],
  ["bhindi-masala", 130, "LUNCH", "PRESET_TAP", 13],
  ["curd-dahi", 150, "LUNCH", "PRESET_TAP", 13],
  ["whey-scoop", 30, "SNACK", "BARCODE_SCAN", 17],
  ["roti-wheat", 120, "DINNER", "PRESET_TAP", 20],
  ["paneer-bhurji", 150, "DINNER", "PRESET_TAP", 20],
];

/**
 * The last 30 days minus two gaps. `activeDates` below is built from the same
 * list, so the streak heatmap and the logged history describe one history
 * rather than two that happen to disagree.
 */
const LOGGED_DAY_OFFSETS = Array.from({ length: 30 }, (_, i) => i).filter(
  (i) => i !== 9 && i !== 17,
);

/**
 * Every log the account has, not just today's — the Today screen filters to a
 * date and the adherence strip reads across them.
 */
export const MOCK_LOGS: FoodLog[] = LOGGED_DAY_OFFSETS.flatMap((daysAgo) => {
  if (daysAgo === 0) return TODAY.map((t, i) => log(`log_0_${i}`, ...t, 0));

  // Deterministic 0.82–1.26 scale, so past days land genuinely over, under and
  // on target instead of repeating one identical day behind the user.
  const scale = 0.82 + ((daysAgo * 37) % 45) / 100;
  return FULL_DAY.map(([foodItemId, grams, mealSlot, loggedVia, hour], i) =>
    log(
      `log_${daysAgo}_${i}`,
      foodItemId,
      Math.round(grams * scale),
      mealSlot,
      loggedVia,
      hour,
      daysAgo,
    ),
  );
});

export const MOCK_USUALS: UsualMeal[] = [
  { foodItemId: "poha", mealSlot: "BREAKFAST", timesLogged: 14 },
  { foodItemId: "dal-tadka", mealSlot: "LUNCH", timesLogged: 11 },
  { foodItemId: "rice-basmati", mealSlot: "LUNCH", timesLogged: 11 },
  { foodItemId: "whey-scoop", mealSlot: "SNACK", timesLogged: 22 },
  { foodItemId: "roti-wheat", mealSlot: "DINNER", timesLogged: 9 },
  { foodItemId: "paneer-bhurji", mealSlot: "DINNER", timesLogged: 7 },
].map(({ foodItemId, mealSlot, timesLogged }) => {
  const item = foodById(foodItemId)!;
  const grams = item.servingSizeG ?? 100;
  const macros = macrosForPortion(item, grams);
  return {
    foodItemId,
    name: item.name,
    portionLabel: item.portionLabel,
    portionGrams: grams,
    calories: macros.caloriesLogged,
    proteinG: macros.proteinLoggedG,
    carbsG: macros.carbsLoggedG,
    fatG: macros.fatLoggedG,
    mealSlot: mealSlot as UsualMeal["mealSlot"],
    timesLogged,
  };
});

export const MOCK_PHOTOS: ProgressPhoto[] = [
  {
    id: "photo_1",
    uri: require("@/assets/images/progress/photo-1.jpg"),
    angle: "FRONT",
    weightKgAtCapture: 82.4,
    capturedAt: iso(84, 7, 45),
  },
  {
    id: "photo_2",
    uri: require("@/assets/images/progress/photo-2.jpg"),
    angle: "FRONT",
    weightKgAtCapture: 80.6,
    capturedAt: iso(56, 7, 45),
  },
  {
    id: "photo_3",
    uri: require("@/assets/images/progress/photo-3.jpg"),
    angle: "FRONT",
    weightKgAtCapture: 79.1,
    capturedAt: iso(28, 7, 45),
  },
  {
    id: "photo_4",
    uri: require("@/assets/images/progress/photo-4.jpg"),
    angle: "FRONT",
    weightKgAtCapture: 77.9,
    capturedAt: iso(2, 7, 45),
  },
];

const activeDates = LOGGED_DAY_OFFSETS.map((daysAgo) => localDateKey(addDays(now, -daysAgo)));

export const MOCK_STREAK: StreakState = {
  currentStreak: 9,
  longestStreak: 23,
  freezesRemaining: 1,
  freezesResetAt: iso(-18, 0),
  lastActiveLocalDate: localDateKey(now),
  activeDates,
  frozenDates: [localDateKey(addDays(now, -9))],
};

export const MOCK_SUBSCRIPTION: Subscription = {
  tier: "FREE",
  currentPeriodEnd: null,
};

/** A brand-new account, so every empty state is reachable during review. */
export const NEW_USER: User = withTargets({
  ...MOCK_PROFILE,
  displayName: "Arjun",
  startingWeightKg: 82.4,
  currentWeightKg: 82.4,
  currentWeightUpdatedAt: null,
});

export const NEW_USER_STREAK: StreakState = {
  currentStreak: 0,
  longestStreak: 0,
  freezesRemaining: 2,
  freezesResetAt: iso(-30, 0),
  lastActiveLocalDate: localDateKey(now),
  activeDates: [],
  frozenDates: [],
};

/**
 * Reminders start on and the quiet window starts wide. PRD 10.1 prefers
 * ambient signals over pushes, so the defaults here are the least intrusive
 * set that still makes the feature discoverable.
 */
export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  mealReminders: true,
  weighInReminder: true,
  streakMilestones: true,
  quietHoursStart: 22,
  quietHoursEnd: 7,
};

/** Private by default, per PRD 6.1 — sharing is always an explicit action. */
export const DEFAULT_PRIVACY_PREFS: PrivacyPrefs = {
  photosPrivateByDefault: true,
  shareIncludesStats: true,
  analyticsOptOut: false,
};
