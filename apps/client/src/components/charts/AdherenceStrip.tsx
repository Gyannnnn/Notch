import { useRouter } from "expo-router";
import { useMemo } from "react";
import { View } from "react-native";

import { DayGrid } from "@/components/charts/DayGrid";
import { Text } from "@/components/ui/Text";
import { useAdherence } from "@/hooks/data";
import type { AdherenceState } from "@/lib/adherence";
import { formatShortDate } from "@/lib/date";
import { colors } from "@/theme/tokens";

/**
 * A day with no data uses the plain hairline — the same neutral as any other
 * structural line, so an unlogged day is never marked as a failure.
 */
const STATE_COLOR: Record<AdherenceState, string> = {
  "on-track": colors.primary,
  over: colors.caution,
  under: colors["primary-soft"],
  empty: colors.hairline,
};

const STATE_LABEL: Record<AdherenceState, string> = {
  "on-track": "on track",
  over: "over target",
  under: "under target",
  empty: "nothing logged",
};

export function AdherenceStrip({ weeks = 4 }: { weeks?: number }) {
  const router = useRouter();
  const { data } = useAdherence(weeks);

  const cells = useMemo(
    () =>
      data.map((day) => ({
        dateKey: day.dateKey,
        color: STATE_COLOR[day.state],
        label: `${formatShortDate(day.dateKey)}, ${STATE_LABEL[day.state]}`,
      })),
    [data],
  );

  return (
    <View className="gap-sm">
      <DayGrid
        days={cells}
        onPressDay={(dateKey) =>
          router.push({ pathname: "/(tabs)/today", params: { date: dateKey } })
        }
      />
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
