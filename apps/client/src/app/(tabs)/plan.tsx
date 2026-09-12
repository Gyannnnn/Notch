import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { TrendChart } from "@/components/charts/TrendChart";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ListRow } from "@/components/ui/ListRow";
import { Screen } from "@/components/ui/Screen";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Text } from "@/components/ui/Text";
import { useUser, useWeightTrend } from "@/hooks/data";
import { defaultUnits, formatWeight, formatWeightDelta } from "@/lib/units";
import type { TrendRange } from "@/lib/weightTrend";
import { AdherenceStrip } from "@/components/charts/AdherenceStrip";

const RANGES: { value: TrendRange; label: string }[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "all", label: "All" },
];

export default function PlanScreen() {
  const router = useRouter();
  const [range, setRange] = useState<TrendRange>("month");
  const { data: user } = useUser();
  const { data } = useWeightTrend(range);
  const unit = defaultUnits(user.region).weight;

  const paceTone =
    data.pace.state === "ON_PACE"
      ? "positive"
      : data.pace.state === "INSUFFICIENT"
        ? "neutral"
        : "caution";

  return (
    <Screen tabBarPadding>
      <View className="row-between pt-xs">
        <Text variant="heading-lg">Plan</Text>
        <Button
          label="Log weight"
          variant="secondary"
          icon="plus"
          onPress={() => router.push("/(modals)/weight-entry")}
        />
      </View>

      <View className="gap-md pt-md">
        <SegmentedControl segments={RANGES} value={range} onChange={setRange} />

        <Card className="gap-sm">
          {/* Explicit alignment: the two stacks are different heights, and
              row-between would centre them against each other. */}
          <View className="row-between" style={{ alignItems: "flex-start" }}>
            <View className="gap-xxs">
              <Text variant="label-sm" color="mute">
                Current
              </Text>
              <Text variant="metric-lg" tabular>
                {data.latestKg !== null ? formatWeight(data.latestKg, unit) : "—"}
              </Text>
            </View>
            <View className="items-end gap-xxs">
              <Text variant="label-sm" color="mute">
                Change
              </Text>
              <Text variant="metric-md" tabular>
                {formatWeightDelta(data.deltaKg, unit)}
              </Text>
            </View>
          </View>
          <Badge label={data.pace.label} tone={paceTone} className="self-start" />
          <TrendChart
            points={data.points}
            formatValue={(v) => formatWeight(v, unit, 1)}
          />
        </Card>

        <Card padded={false} className="px-md">
          <ListRow
            title="Daily targets"
            subtitle={
              user.dailyProteinTargetG
                ? `${user.dailyProteinTargetG}g protein · ${user.dailyCarbsTargetG}g carbs · ${user.dailyFatTargetG}g fat`
                : "Set your calories and macros"
            }
            value={user.dailyCalorieTarget ? `${user.dailyCalorieTarget} kcal` : "Not set"}
            onPress={() => router.push("/(modals)/targets")}
            showChevron
          />
        </Card>

        <Card className="gap-sm">
          <Text variant="heading-md">Calorie adherence</Text>
          <Text variant="body-sm" color="mute">
            How each day landed against your target.
          </Text>
          <AdherenceStrip />
        </Card>
      </View>
    </Screen>
  );
}
