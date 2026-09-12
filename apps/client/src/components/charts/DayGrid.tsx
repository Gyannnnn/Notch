import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { WEEKDAY_INITIALS, weekdayIndex } from "@/lib/date";

const COLUMNS = 7;

export interface DayCell {
  dateKey: string;
  color: string;
  /** Spoken description of the day, e.g. "12 Sep, on track". */
  label: string;
}

interface DayGridProps {
  /** Oldest first. */
  days: DayCell[];
  onPressDay?: (dateKey: string) => void;
}

/**
 * A calendar, not a ribbon. Laying the days out seven to a row means every row
 * is a week and every column is a weekday — where a plain wrapping strip breaks
 * at whatever number happens to fit and leaves a ragged last row.
 *
 * Cells size themselves with flex rather than a percentage so the columns
 * divide the container exactly at any width, with no measurement pass.
 */
export function DayGrid({ days, onPressDay }: DayGridProps) {
  if (days.length === 0) return null;

  // Pad both ends to whole weeks so every row is full and the columns stay
  // aligned to their weekday.
  const leading = weekdayIndex(days[0]!.dateKey);
  const cells: (DayCell | null)[] = [...Array<null>(leading).fill(null), ...days];
  while (cells.length % COLUMNS !== 0) cells.push(null);

  const rows = Array.from({ length: cells.length / COLUMNS }, (_, i) =>
    cells.slice(i * COLUMNS, (i + 1) * COLUMNS),
  );

  return (
    <View className="gap-xxs">
      <View className="row gap-xxs">
        {WEEKDAY_INITIALS.map((initial, i) => (
          <View key={i} className="fill center">
            <Text variant="label-sm" color="faint">
              {initial}
            </Text>
          </View>
        ))}
      </View>

      {rows.map((row, rowIndex) => (
        <View key={rowIndex} className="row gap-xxs">
          {row.map((cell, columnIndex) =>
            cell === null ? (
              <View key={columnIndex} className="fill" style={{ aspectRatio: 1 }} />
            ) : onPressDay ? (
              <Pressable
                key={cell.dateKey}
                accessibilityRole="button"
                accessibilityLabel={cell.label}
                onPress={() => onPressDay(cell.dateKey)}
                className="fill rounded-xs active:opacity-70"
                style={{ aspectRatio: 1, backgroundColor: cell.color }}
              />
            ) : (
              <View
                key={cell.dateKey}
                accessibilityLabel={cell.label}
                className="fill rounded-xs"
                style={{ aspectRatio: 1, backgroundColor: cell.color }}
              />
            ),
          )}
        </View>
      ))}
    </View>
  );
}
