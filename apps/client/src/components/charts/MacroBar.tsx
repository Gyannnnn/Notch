import { useEffect } from "react";
import { View } from "react-native";
import {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Text } from "@/components/ui/Text";
import { MotionView } from "@/lib/animated";
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
  const reduced = useReducedMotion();
  const width = useSharedValue(reduced ? ratio : 0);

  useEffect(() => {
    if (reduced) {
      width.set(ratio);
      return;
    }
    width.set(withTiming(ratio, { duration: motion.standard }));
  }, [ratio, reduced, width]);

  // Animating width is a layout pass, which is normally the thing to avoid — but
  // the fill is a childless leaf inside a fixed-height track, so nothing else
  // re-lays-out, and it keeps the pill radius that a scaleX would smear.
  const fillStyle = useAnimatedStyle(() => ({ width: `${width.get() * 100}%` }));

  return (
    <View
      className="gap-xxs"
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${label}: ${Math.round(grams)} of ${target} grams`}
      accessibilityValue={{ min: 0, max: target, now: Math.round(grams) }}
    >
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
        <MotionView
          className="h-full rounded-pill"
          style={[{ backgroundColor: MACRO_COLOR[macro] }, fillStyle]}
        />
      </View>
    </View>
  );
}
