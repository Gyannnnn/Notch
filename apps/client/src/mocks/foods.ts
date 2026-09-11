import type { FoodItem } from "@/types/domain";

/**
 * Preset dishes stand in for the IFCT-derived library described in TRD §8.
 * `portionLabel` is how people actually measure these ("1 katori", "2 roti"),
 * and the UI leads with it — grams are the secondary detail.
 */
const preset = (
  id: string,
  name: string,
  portionLabel: string,
  servingSizeG: number,
  per100: [number, number, number, number],
): FoodItem => ({
  id,
  source: "PRESET",
  name,
  brandName: null,
  presetSlug: id,
  caloriesPer100g: per100[0],
  proteinPer100g: per100[1],
  carbsPer100g: per100[2],
  fatPer100g: per100[3],
  servingSizeG,
  portionLabel,
  verifiedSource: true,
});

const packaged = (
  id: string,
  name: string,
  brandName: string,
  servingSizeG: number,
  per100: [number, number, number, number],
): FoodItem => ({
  id,
  source: "BARCODE",
  name,
  brandName,
  presetSlug: null,
  caloriesPer100g: per100[0],
  proteinPer100g: per100[1],
  carbsPer100g: per100[2],
  fatPer100g: per100[3],
  servingSizeG,
  portionLabel: `1 serving`,
  verifiedSource: false,
});

export const FOOD_ITEMS: FoodItem[] = [
  preset("dal-tadka", "Dal Tadka", "1 katori", 150, [122, 6.1, 15.2, 4.3]),
  preset("dal-fry", "Dal Fry", "1 katori", 150, [134, 5.8, 16.0, 5.2]),
  preset("rice-basmati", "Basmati Rice", "1 katori", 150, [130, 2.7, 28.2, 0.3]),
  preset("roti-wheat", "Roti", "1 roti", 40, [297, 9.2, 56.8, 4.1]),
  preset("paneer-bhurji", "Paneer Bhurji", "1 katori", 120, [232, 14.1, 6.2, 17.4]),
  preset("aloo-gobi", "Aloo Gobi", "1 katori", 140, [112, 2.6, 12.4, 6.1]),
  preset("bhindi-masala", "Bhindi Masala", "1 katori", 130, [104, 2.1, 9.3, 6.8]),
  preset("rajma-masala", "Rajma Masala", "1 katori", 150, [128, 6.4, 18.1, 3.4]),
  preset("chicken-curry", "Chicken Curry", "1 katori", 150, [182, 16.2, 4.1, 11.3]),
  preset("egg-boiled", "Boiled Egg", "1 egg", 50, [155, 12.6, 1.1, 10.6]),
  preset("curd-dahi", "Curd", "1 katori", 150, [61, 3.5, 4.7, 3.3]),
  preset("poha", "Poha", "1 plate", 180, [130, 2.5, 24.8, 2.8]),
  preset("idli", "Idli", "2 idli", 120, [136, 4.1, 27.2, 0.6]),
  preset("upma", "Upma", "1 katori", 160, [148, 3.4, 22.1, 5.1]),
  preset("banana", "Banana", "1 medium", 118, [89, 1.1, 22.8, 0.3]),
  packaged("whey-scoop", "Whey Protein", "Optimum Nutrition", 30, [400, 80.0, 8.0, 6.0]),
  packaged("oats-quaker", "Rolled Oats", "Quaker", 40, [389, 16.9, 66.3, 6.9]),
  packaged("peanut-butter", "Peanut Butter", "Pintola", 32, [588, 25.1, 20.0, 50.0]),
  packaged("greek-yogurt", "Greek Yogurt", "Epigamia", 90, [97, 9.1, 8.4, 3.0]),
  packaged("masala-chaas", "Masala Chaas", "Amul", 200, [32, 1.6, 3.2, 1.4]),
];

export const foodById = (id: string) => FOOD_ITEMS.find((f) => f.id === id);

/** Canned result for the mocked barcode scan. */
export const BARCODE_RESULT = foodById("whey-scoop")!;

/** Canned result for the mocked photo-AI detection, with per-item confidence. */
export const AI_DETECTION = {
  confidence: 0.82,
  items: [
    { foodItemId: "rice-basmati", grams: 150, confidence: 0.91 },
    { foodItemId: "dal-tadka", grams: 150, confidence: 0.86 },
    { foodItemId: "bhindi-masala", grams: 130, confidence: 0.64 },
  ],
};
