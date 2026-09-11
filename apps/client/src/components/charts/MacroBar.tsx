import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { Text } from "@/components/ui/Text";
import type { MacroKey } from "@/lib/macros";
import { colors, motion } from "@/theme/tokens";

const MACRO_COLOR: Record<MacroKey, string> = {
  protein: colors["macro-protein"],
  carbs: colors["macro-carbs"],
  fat: colors["macro-fat"],
};

interface MacroBarProps {
  macro: MacroKey;
  label: string;
  grams: number;
  target: number;
}

export function MacroBar({ macro, label, grams, target }: MacroBarProps) {
  const ratio = target > 0 ? Math.min(grams / target, 1) : 0;
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(ratio, { duration: motion.standard });
  }, [ratio, width]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${width.value * 100}%` }));

  return (
    <View className="gap-xxs">
      <Text variant="label-sm" color="mute">
        {label}
      </Text>
      <Text variant="metric-md" tabular>
        {Math.round(grams)}
        <Text variant="body-sm" color="mute">
          {` / ${target}g`}
        </Text>
      </Text>
      <View className="overflow-hidden rounded-pill bg-hairline" style={{ height: 6 }}>
        <Animated.View
          className="h-full rounded-pill"
          style={[{ backgroundColor: MACRO_COLOR[macro] }, fillStyle]}
        />
      </View>
    </View>
  );
}
