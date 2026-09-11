import Feather from "@expo/vector-icons/Feather";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { View } from "react-native";

import { Sparkline } from "@/components/charts/Sparkline";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { useComparison, useStreak, useWeightTrend } from "@/hooks/data";
import { formatDuration } from "@/lib/date";
import { formatWeight, formatWeightDelta, type WeightUnit } from "@/lib/units";
import { colors } from "@/theme/tokens";

interface TeaserProps {
  unit: WeightUnit;
}

export function ProgressTeaser({ unit }: TeaserProps) {
  const router = useRouter();
  const { data: comparison } = useComparison("1m");

  if (!comparison) {
    return (
      <Card onPress={() => router.push("/(modals)/photo-capture")} className="fill gap-xs">
        <Feather name="camera" size={20} color={colors.faint} />
        <Text variant="heading-sm">Take your first progress photo</Text>
        <Text variant="body-sm" color="mute">
          Two photos is all it takes to see a comparison.
        </Text>
      </Card>
    );
  }

  const { from, to, weightDeltaKg } = comparison;

  return (
    <Card onPress={() => router.push("/(modals)/comparison")} padded={false} className="fill">
      <View className="row gap-xxs p-xs">
        <Image source={from.uri} style={{ flex: 1, aspectRatio: 0.75, borderRadius: 10 }} />
        <Image source={to.uri} style={{ flex: 1, aspectRatio: 0.75, borderRadius: 10 }} />
      </View>
      <View className="gap-xxs px-sm pb-sm">
        <Text variant="heading-sm">Your progress</Text>
        <Text variant="body-sm" color="mute">
          {formatDuration(from.capturedAt, to.capturedAt)}
          {weightDeltaKg !== null ? ` · ${formatWeightDelta(weightDeltaKg, unit)}` : ""}
        </Text>
      </View>
    </Card>
  );
}

export function WeightTeaser({ unit }: TeaserProps) {
  const router = useRouter();
  const { data } = useWeightTrend("month");
  const hasData = data.points.length >= 2;

  return (
    <Card onPress={() => router.push("/(tabs)/plan")} className="fill gap-xs">
      <Text variant="label-sm" color="mute">
        Weight
      </Text>
      {hasData ? (
        <>
          <Text variant="metric-lg" tabular>
            {formatWeight(data.latestKg ?? 0, unit, 1)}
          </Text>
          <Sparkline values={data.points.map((p) => p.average)} width={110} height={28} />
          <Badge
            label={data.pace.label}
            tone={
              data.pace.state === "ON_PACE"
                ? "positive"
                : data.pace.state === "INSUFFICIENT"
                  ? "neutral"
                  : "caution"
            }
          />
        </>
      ) : (
        <>
          <Text variant="heading-sm">Log your weight</Text>
          <Text variant="body-sm" color="mute">
            A few entries and your trend appears here.
          </Text>
        </>
      )}
    </Card>
  );
}

export function StreakTeaser() {
  const router = useRouter();
  const { data: streak } = useStreak();
  const active = streak.currentStreak > 0;

  return (
    <Card onPress={() => router.push("/(modals)/streak")} className="fill gap-xs">
      <View className="row gap-xxs">
        <Feather name="zap" size={18} color={active ? colors.caution : colors.faint} />
        <Text variant="label-sm" color="mute">
          Streak
        </Text>
      </View>
      <Text variant="metric-lg" tabular>
        {streak.currentStreak}
        <Text variant="body-sm" color="mute">
          {streak.currentStreak === 1 ? " day" : " days"}
        </Text>
      </Text>
      <Text variant="body-sm" color="mute">
        {active
          ? `${streak.freezesRemaining} ${streak.freezesRemaining === 1 ? "freeze" : "freezes"} left`
          : "Log anything today to start"}
      </Text>
    </Card>
  );
}
