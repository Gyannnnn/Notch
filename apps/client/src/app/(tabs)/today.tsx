import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { CalorieRing } from "@/components/charts/CalorieRing";
import { MacroBar } from "@/components/charts/MacroBar";
import { MealList } from "@/components/home/MealList";
import { ProgressTeaser, StreakTeaser, WeightTeaser } from "@/components/home/TeaserCards";
import { UsualsRow } from "@/components/home/UsualsRow";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useHomeData, useUser } from "@/hooks/data";
import { greetingForHour } from "@/lib/date";
import { MACRO_LABELS, macroValues } from "@/lib/macros";
import { defaultUnits } from "@/lib/units";

/** Rows fade and rise in sequence rather than all at once (DESIGN.md motion). */
const stagger = (index: number) => FadeInDown.duration(180).delay(index * 35);

export default function TodayScreen() {
  const router = useRouter();
  const { data: user } = useUser();
  const { data } = useHomeData();
  const unit = defaultUnits(user.region).weight;

  const macros = macroValues(data.totals);
  const macroTargets = macroValues(data.targets);

  return (
    <Screen tabBarPadding>
      <Animated.View entering={stagger(0)} className="row-between pt-xs">
        <View>
          <Text variant="body-md" color="mute">
            {greetingForHour()}
          </Text>
          <Text variant="heading-lg">{data.greetingName}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Profile"
          onPress={() => router.push("/(tabs)/you")}
          className="center rounded-full border border-hairline bg-elevated"
          style={{ width: 44, height: 44 }}
        >
          <Text variant="label-md" color="body">
            {(data.greetingName[0] ?? "?").toUpperCase()}
          </Text>
        </Pressable>
      </Animated.View>

      <Animated.View entering={stagger(1)} className="center py-lg">
        <CalorieRing consumed={data.totals.calories} target={data.targets.calories} />
      </Animated.View>

      <Animated.View entering={stagger(2)} className="row gap-xs">
        {(["protein", "carbs", "fat"] as const).map((macro) => (
          <Card key={macro} className="fill" padded={false}>
            <View className="p-sm">
              <MacroBar
                macro={macro}
                label={MACRO_LABELS[macro]}
                grams={macros[macro]}
                target={macroTargets[macro]}
              />
            </View>
          </Card>
        ))}
      </Animated.View>

      <Animated.View
        entering={stagger(3)}
        className="mt-lg rounded-md bg-primary-soft px-md py-sm"
      >
        <Text variant="body-md" color="ink">
          {data.insight}
        </Text>
      </Animated.View>

      <Animated.View entering={stagger(4)} className="mt-lg gap-xs">
        <ProgressTeaser unit={unit} />
        <View className="row items-stretch gap-xs">
          <WeightTeaser unit={unit} />
          <StreakTeaser />
        </View>
      </Animated.View>

      <Animated.View entering={stagger(5)} className="mt-lg">
        <UsualsRow />
      </Animated.View>

      <Animated.View entering={stagger(6)} className="mt-lg">
        <MealList groups={data.mealGroups} nextSlot={data.nextSlot} />
      </Animated.View>
    </Screen>
  );
}
