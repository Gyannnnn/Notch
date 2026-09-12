import Feather from "@expo/vector-icons/Feather";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Text } from "@/components/ui/Text";
import { useLogFood, useUsuals } from "@/hooks/data";
import { usePressScale } from "@/hooks/usePressScale";
import { AnimatedPressable } from "@/lib/animated";
import type { UsualMeal } from "@/types/domain";
import { colors, curve, elevation } from "@/theme/tokens";

/** How long the check mark stands in for the plus after a log. */
const CONFIRM_MS = 1200;

/**
 * One tap logs a usual and the ring responds immediately — the "≤2 taps from
 * Home" path in PRD 6.2.
 */
export function UsualsRow() {
  const { data: usuals } = useUsuals();
  const logFood = useLogFood();
  // Carries a tick as well as the id so that re-tapping the same tile restarts
  // the confirmation rather than inheriting the first tap's deadline.
  const [confirmed, setConfirmed] = useState<{ id: string; tick: number } | null>(null);

  useEffect(() => {
    if (!confirmed) return;
    const timer = setTimeout(() => setConfirmed(null), CONFIRM_MS);
    return () => clearTimeout(timer);
  }, [confirmed]);

  const onLog = (usual: UsualMeal) => {
    logFood({
      foodItemId: usual.foodItemId,
      grams: usual.portionGrams,
      mealSlot: usual.mealSlot,
      loggedVia: "USUAL_REPEAT",
    });
    // Fired with the check-mark swap, not after it: a haptic that lags its
    // visual reads as a glitch rather than as confirmation.
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setConfirmed((prev) => ({ id: usual.foodItemId, tick: (prev?.tick ?? 0) + 1 }));
  };

  return (
    <View className="gap-xs">
      <Text variant="overline" color="mute">
        Your usuals
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-xs pr-md"
      >
        {usuals.map((usual) => (
          <UsualTile
            key={usual.foodItemId}
            usual={usual}
            logged={confirmed?.id === usual.foodItemId}
            onPress={() => onLog(usual)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

interface UsualTileProps {
  usual: UsualMeal;
  logged: boolean;
  onPress: () => void;
}

function UsualTile({ usual, logged, onPress }: UsualTileProps) {
  const press = usePressScale();

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={logged ? `${usual.name} logged` : `Log ${usual.name}`}
      onPress={onPress}
      {...press.handlers}
      className="justify-between rounded-lg border border-hairline bg-elevated p-sm"
      // minHeight rather than height so the tile grows with the type size
      // instead of clipping the dish name.
      style={[{ width: 132, minHeight: 104 }, curve, elevation.whisper, press.style]}
    >
      <View className="row-between">
        <Text variant="body-sm" color="mute">
          {usual.portionLabel}
        </Text>
        {logged ? (
          <Animated.View
            entering={FadeIn.duration(120)}
            className="center rounded-full bg-primary"
            style={{ width: 22, height: 22 }}
          >
            <Feather name="check" size={14} color={colors["on-primary"]} />
          </Animated.View>
        ) : (
          <Feather name="plus-circle" size={20} color={colors.faint} />
        )}
      </View>
      <Text variant="heading-sm" numberOfLines={2}>
        {usual.name}
      </Text>
      <Text variant="label-sm" color="mute" tabular>
        {usual.calories} kcal
      </Text>
    </AnimatedPressable>
  );
}
