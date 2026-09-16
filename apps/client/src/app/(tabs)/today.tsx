import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { View } from "react-native";
import { FadeIn, FadeInDown, useReducedMotion } from "react-native-reanimated";

import { CalorieRing } from "@/components/charts/CalorieRing";
import { MacroBar } from "@/components/charts/MacroBar";
import { DayNav } from "@/components/home/DayNav";
import { MealList } from "@/components/home/MealList";
import { ProgressTeaser, StreakTeaser, WeightTeaser } from "@/components/home/TeaserCards";
import { UsualsRow } from "@/components/home/UsualsRow";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { useHomeData, useUser } from "@/hooks/data";
import { usePressScale } from "@/hooks/usePressScale";
import { MotionPressable, MotionView } from "@/lib/animated";
import { greetingForHour, localDateKey } from "@/lib/date";
import { MACRO_LABELS, macroValues } from "@/lib/macros";
import { defaultUnits } from "@/lib/units";
import { curve, motion } from "@/theme/tokens";

/**
 * Rows fade and rise in sequence rather than all at once (DESIGN.md motion).
 * Reduced motion keeps the fade and drops the travel and the stagger — fewer and
 * gentler, not nothing, so the screen still reads as arriving.
 */
const staggerFor = (reduced: boolean) => (index: number) =>
  reduced
    ? FadeIn.duration(motion.quick)
    : FadeInDown.duration(motion.quick).delay(index * 35);

export default function TodayScreen() {
  const router = useRouter();
  // The day lives in the route rather than in state, so paging here and
  // arriving from an adherence cell are the same mechanism. Returning to today
  // clears the param instead of pinning it.
  const params = useLocalSearchParams<{ date?: string }>();
  const dateKey = params.date ?? localDateKey();
  const setDateKey = useCallback(
    (next: string) => router.setParams({ date: next === localDateKey() ? undefined : next }),
    [router],
  );

  const { data: user } = useUser();
  const { data } = useHomeData(dateKey);
  const unit = defaultUnits(user.region).weight;

  const reduced = useReducedMotion();
  const stagger = staggerFor(reduced);
  const avatarPress = usePressScale();

  const macros = macroValues(data.totals);
  const macroTargets = macroValues(data.targets);

  return (
    <Screen tabBarPadding>
      {data.isToday && (
        <MotionView entering={stagger(0)} className="row-between pt-xs">
          <View>
            <Text variant="body-md" color="mute">
              {greetingForHour()}
            </Text>
            <Text variant="heading-lg">{data.greetingName}</Text>
          </View>
          <MotionPressable
            accessibilityRole="button"
            accessibilityLabel="Profile"
            onPress={() => router.push("/(tabs)/you")}
            {...avatarPress.handlers}
            hitSlop={8}
            className="center rounded-full border border-hairline bg-elevated"
            style={[avatarPress.style, { width: 44, height: 44 }]}
          >
            <Text variant="label-md" color="body">
              {(data.greetingName[0] ?? "?").toUpperCase()}
            </Text>
          </MotionPressable>
        </MotionView>
      )}

      <MotionView entering={stagger(1)} className="pt-xs">
        <DayNav dateKey={dateKey} onChange={setDateKey} />
      </MotionView>

      <MotionView entering={stagger(2)} className="center py-lg">
        <CalorieRing consumed={data.totals.calories} target={data.targets.calories} />
      </MotionView>

      <MotionView entering={stagger(3)} className="row gap-xs">
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
      </MotionView>

      <MotionView
        entering={stagger(4)}
        className="mt-lg rounded-md bg-primary-soft px-md py-sm"
        style={curve}
      >
        <Text variant="body-md" color="ink" selectable>
          {data.insight}
        </Text>
      </MotionView>

      {/* The teasers and usuals are about right now; on a past day the only
          thing worth showing is what was actually eaten. */}
      {data.isToday && (
        <>
          <MotionView entering={stagger(5)} className="mt-lg gap-xs">
            <ProgressTeaser unit={unit} />
            <View className="row items-stretch gap-xs">
              <WeightTeaser unit={unit} />
              <StreakTeaser />
            </View>
          </MotionView>

          <MotionView entering={stagger(6)} className="mt-lg">
            <UsualsRow />
          </MotionView>
        </>
      )}

      <MotionView entering={stagger(7)} className="mt-lg">
        <MealList
          groups={data.mealGroups}
          nextSlot={data.nextSlot}
          dateKey={dateKey}
          isToday={data.isToday}
        />
      </MotionView>
    </Screen>
  );
}
