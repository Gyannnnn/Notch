const MS_PER_DAY = 86_400_000;

/** "YYYY-MM-DD" in local time — the key streaks and daily grouping are keyed by. */
export function localDateKey(date: Date | string = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date;
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
  const d = typeof date === "string" ? new Date(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Most recent `count` days, oldest first. */
export function recentDateKeys(count: number, from: Date = new Date()): string[] {
  return Array.from({ length: count }, (_, i) => localDateKey(addDays(from, i - count + 1)));
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function formatDuration(from: Date | string, to: Date | string): string {
  const days = Math.abs(daysBetween(from, to));
  if (days < 14) return `${days} ${days === 1 ? "day" : "days"}`;
  if (days < 60) return `${Math.round(days / 7)} weeks`;
  return `${Math.round(days / 30)} months`;
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
