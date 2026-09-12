const MS_PER_DAY = 86_400_000;

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * `new Date("2026-09-12")` is parsed as UTC midnight, which lands on the
 * previous day anywhere west of Greenwich. Every helper here goes through this
 * so a date key always means the local day it spells.
 */
export function parseDateKey(value: Date | string): Date {
  if (typeof value !== "string") return value;
  if (!DATE_KEY.test(value)) return new Date(value);
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year!, month! - 1, day!);
}

/** "YYYY-MM-DD" in local time — the key streaks and daily grouping are keyed by. */
export function localDateKey(date: Date | string = new Date()): string {
  const d = parseDateKey(date);
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

export function isSameLocalDay(a: Date | string, b: Date | string): boolean {
  return localDateKey(a) === localDateKey(b);
}

export function daysBetween(from: Date | string, to: Date | string): number {
  const a = new Date(localDateKey(from)).getTime();
  const b = new Date(localDateKey(to)).getTime();
  return Math.round((b - a) / MS_PER_DAY);
}

export function addDays(date: Date | string, days: number): Date {
  const d = new Date(parseDateKey(date));
  d.setDate(d.getDate() + days);
  return d;
}

/** Most recent `count` days, oldest first. */
export function recentDateKeys(count: number, from: Date = new Date()): string[] {
  return Array.from({ length: count }, (_, i) => localDateKey(addDays(from, i - count + 1)));
}

export function formatShortDate(date: Date | string): string {
  return parseDateKey(date).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/** The label above a day's logs: relative for the recent past, dated before that. */
export function formatDayLabel(dateKey: string): string {
  const diff = daysBetween(dateKey, new Date());
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return parseDateKey(dateKey).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatDuration(from: Date | string, to: Date | string): string {
  const days = Math.abs(daysBetween(from, to));
  if (days < 14) return `${days} ${days === 1 ? "day" : "days"}`;
  if (days < 60) return `${Math.round(days / 7)} weeks`;
  return `${Math.round(days / 30)} months`;
}

/**
 * Date keys from the Monday that opens the week `weeks - 1` weeks back, through
 * today. A grid built from this starts on a full week, where "the last N days"
 * would open with a stray day or two floating in an otherwise empty row.
 */
export function recentWeekDateKeys(weeks: number, from: Date = new Date()): string[] {
  const start = addDays(from, -(weekdayIndex(from) + (weeks - 1) * 7));
  return Array.from({ length: daysBetween(start, from) + 1 }, (_, i) =>
    localDateKey(addDays(start, i)),
  );
}

/** Weekday initials in the order the day grids use, Monday first. */
export const WEEKDAY_INITIALS = ["M", "T", "W", "T", "F", "S", "S"] as const;

/** Monday-based weekday, 0-6 — `getDay()` is Sunday-based. */
export function weekdayIndex(date: Date | string): number {
  return (parseDateKey(date).getDay() + 6) % 7;
}

export function greetingForHour(hour: number = new Date().getHours()): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** Meal slot a user is most likely logging right now, used to pre-select slots. */
export function currentMealSlot(hour: number = new Date().getHours()) {
  if (hour < 11) return "BREAKFAST" as const;
  if (hour < 16) return "LUNCH" as const;
  if (hour < 21) return "DINNER" as const;
  return "SNACK" as const;
}
