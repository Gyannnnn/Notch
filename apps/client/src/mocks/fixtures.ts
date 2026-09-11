import type {
  FoodLog,
  ProgressPhoto,
  StreakState,
  Subscription,
  UsualMeal,
  User,
  WeightEntry,
} from "@/types/domain";
import { addDays, localDateKey } from "@/lib/date";
import { macrosForPortion } from "@/lib/macros";
import { foodById } from "./foods";

/** Everything is generated relative to now, so the app never looks stale. */
const now = new Date();
const iso = (daysAgo: number, hour = 9, minute = 0) => {
  const d = addDays(now, -daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const MOCK_USER: User = {
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
  dailyCalorieTarget: 2200,
  dailyProteinTargetG: 165,
  dailyCarbsTargetG: 220,
  dailyFatTargetG: 62,
  onboardingComplete: true,
};

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
    loggedAt: iso(0, hour),
  };
};

export const MOCK_TODAY_LOGS: FoodLog[] = [
  log("log_1", "poha", 180, "BREAKFAST", "USUAL_REPEAT", 8),
  log("log_2", "egg-boiled", 100, "BREAKFAST", "PRESET_TAP", 8),
  log("log_3", "rice-basmati", 150, "LUNCH", "PRESET_TAP", 13),
  log("log_4", "dal-tadka", 150, "LUNCH", "PRESET_TAP", 13),
  log("log_5", "bhindi-masala", 130, "LUNCH", "PRESET_TAP", 13),
  log("log_6", "whey-scoop", 30, "SNACK", "BARCODE_SCAN", 17),
];

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

const activeDates = Array.from({ length: 30 }, (_, i) => localDateKey(addDays(now, -i))).filter(
  (_, i) => i !== 9 && i !== 17,
);

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
export const NEW_USER: User = {
  ...MOCK_USER,
  displayName: "Arjun",
  startingWeightKg: 82.4,
  currentWeightKg: 82.4,
  currentWeightUpdatedAt: null,
};

export const NEW_USER_STREAK: StreakState = {
  currentStreak: 0,
  longestStreak: 0,
  freezesRemaining: 2,
  freezesResetAt: iso(-30, 0),
  lastActiveLocalDate: localDateKey(now),
  activeDates: [],
  frozenDates: [],
};
