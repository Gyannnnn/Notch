import { View } from "react-native";
import { FadeIn, ZoomIn } from "react-native-reanimated";

import { DayGrid } from "@/components/charts/DayGrid";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Text } from "@/components/ui/Text";
import { useStreak } from "@/hooks/data";
import { MotionView } from "@/lib/animated";
import { formatShortDate, recentWeekDateKeys } from "@/lib/date";
import { colors, motion } from "@/theme/tokens";

export default function StreakScreen() {
  const { data: streak } = useStreak();
  const isMilestone = streak.currentStreak > 0 && streak.currentStreak % 7 === 0;

  // A frozen day is visibly distinct from both logged and empty without
  // reading as a penalty (DESIGN.md).
  const cells = recentWeekDateKeys(5).map((dateKey) => {
    const frozen = streak.frozenDates.includes(dateKey);
    const logged = streak.activeDates.includes(dateKey);
    return {
      dateKey,
      color: frozen ? colors["primary-soft"] : logged ? colors.primary : colors.hairline,
      label: `${formatShortDate(dateKey)}, ${frozen ? "covered by a freeze" : logged ? "logged" : "nothing logged"}`,
    };
  });

  return (
    <Screen>
      <ScreenHeader title="Streak" dismiss />

      <View className="items-center gap-xxs py-lg">
        <MotionView entering={ZoomIn.duration(motion.expressive)}>
          <Text variant="metric-hero" tabular>
            {streak.currentStreak}
          </Text>
        </MotionView>
        <Text variant="label-sm" color="mute">
          {streak.currentStreak === 1 ? "day" : "days"}
        </Text>
      </View>

      {isMilestone && (
        <MotionView
          entering={FadeIn.duration(motion.expressive)}
          className="mb-md rounded-xl bg-primary-soft p-lg"
        >
          <Text variant="heading-lg">{streak.currentStreak} days</Text>
          <Text variant="body-md" color="body">
            A fresh comparison is ready whenever you want to look.
          </Text>
        </MotionView>
      )}

      <View className="row gap-xs">
        <Card className="fill gap-xxs">
          <Text variant="label-sm" color="mute">
            Longest
          </Text>
          <Text variant="metric-md" tabular>
            {streak.longestStreak}
          </Text>
        </Card>
        <Card className="fill gap-xxs">
          <Text variant="label-sm" color="mute">
            Freezes left
          </Text>
          <Text variant="metric-md" tabular>
            {streak.freezesRemaining}
          </Text>
        </Card>
      </View>

      <Card className="mt-md gap-sm">
        <Text variant="heading-md">Last 5 weeks</Text>
        <DayGrid days={cells} />
        <Text variant="body-sm" color="mute">
          Any single log counts for the day. A freeze covers a gap so a missed day doesn&apos;t
          reset anything, and nothing you logged is ever removed.
        </Text>
      </Card>
    </Screen>
  );
}
