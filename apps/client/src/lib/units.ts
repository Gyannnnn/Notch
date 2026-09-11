/**
 * Weight and height are always stored metric (matching the Prisma schema).
 * These convert for display only — nothing here writes back in imperial.
 */

export type WeightUnit = "kg" | "lb";
export type HeightUnit = "cm" | "ft";

const LB_PER_KG = 2.20462;
const CM_PER_INCH = 2.54;

export const kgToLb = (kg: number) => kg * LB_PER_KG;
export const lbToKg = (lb: number) => lb / LB_PER_KG;

export function formatWeight(kg: number, unit: WeightUnit, decimals = 1): string {
  const value = unit === "kg" ? kg : kgToLb(kg);
  return `${value.toFixed(decimals)} ${unit}`;
}

/** Signed, for weight *change* — "-4.2 kg", "+1.3 kg". */
export function formatWeightDelta(deltaKg: number, unit: WeightUnit, decimals = 1): string {
  const value = unit === "kg" ? deltaKg : kgToLb(deltaKg);
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)} ${unit}`;
}

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = Math.round(cm / CM_PER_INCH);
  return { feet: Math.floor(totalInches / 12), inches: totalInches % 12 };
}

export function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * CM_PER_INCH;
}

export function formatHeight(cm: number, unit: HeightUnit): string {
  if (unit === "cm") return `${Math.round(cm)} cm`;
  const { feet, inches } = cmToFeetInches(cm);
  return `${feet}'${inches}"`;
}

/** India defaults to metric, US to imperial; everywhere else follows metric. */
export function defaultUnits(region: "IN" | "US" | "OTHER") {
  return region === "US"
    ? { weight: "lb" as WeightUnit, height: "ft" as HeightUnit }
    : { weight: "kg" as WeightUnit, height: "cm" as HeightUnit };
}
