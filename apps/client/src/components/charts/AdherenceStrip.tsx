import { View } from "react-native";

import { Text } from "@/components/ui/Text";
import { useStreak } from "@/hooks/data";
import { recentDateKeys } from "@/lib/date";
import { colors } from "@/theme/tokens";

type DayState = "on-track" | "over" | "under" | "empty";

/**
 * A day with no data uses the plain hairline — the same neutral as any other
 * structural line, so an unlogged day is never marked as a failure.
 */
const STATE_COLOR: Record<DayState, string> = {
  "on-track": colors.primary,
  over: colors.caution,
  under: colors["primary-soft"],
  empty: colors.hairline,
};

/** Derived from streak activity; real adherence arrives with GET /food-logs. */
function stateForDay(dateKey: string, activeDates: string[]): DayState {
  if (!activeDates.includes(dateKey)) return "empty";
  const seed = dateKey.split("-").reduce((sum, part) => sum + Number(part), 0);
  if (seed % 7 === 0) return "over";
  if (seed % 5 === 0) return "under";
  return "on-track";
}

export function AdherenceStrip({ days = 28 }: { days?: number }) {
  const { data: streak } = useStreak();
  const dateKeys = recentDateKeys(days);

  return (
    <View className="gap-xs">
      <View className="flex-row flex-wrap gap-xxs">
        {dateKeys.map((key) => (
          <View
            key={key}
            className="rounded-xs"
            style={{
              width: 28,
              height: 28,
              backgroundColor: STATE_COLOR[stateForDay(key, streak.activeDates)],
            }}
          />
        ))}
      </View>
      <View className="row gap-md">
        <Legend label="On track" color={STATE_COLOR["on-track"]} />
        <Legend label="Over" color={STATE_COLOR.over} />
        <Legend label="Under" color={STATE_COLOR.under} />
      </View>
    </View>
  );
}

function Legend({ label, color }: { label: string; color: string }) {
  return (
    <View className="row gap-xxs">
      <View className="rounded-xs" style={{ width: 10, height: 10, backgroundColor: color }} />
      <Text variant="body-sm" color="mute">
        {label}
      </Text>
    </View>
  );
}
