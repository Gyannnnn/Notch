import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

import { Text } from "@/components/ui/Text";
import { colors, motion } from "@/theme/tokens";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CalorieRingProps {
  consumed: number;
  target: number;
  size?: number;
  strokeWidth?: number;
}

/**
 * Sweeps clockwise from 12 o'clock. Past target the fill switches to caution and
 * runs a second lap — it never turns red, flashes, or annotates itself, because
 * going over is information rather than a verdict (DESIGN.md).
 */
export function CalorieRing({
  consumed,
  target,
  size = 184,
  strokeWidth = 14,
}: CalorieRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const ratio = target > 0 ? consumed / target : 0;
  const isOver = ratio > 1;
  const sweep = isOver ? Math.min(ratio - 1, 1) : ratio;
  const remaining = Math.round(target - consumed);

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(sweep, {
      duration: motion.ringFill,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
  }, [sweep, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  // Once past target the base ring reads as "full", with the second lap on top.
  const trackColor = isOver ? colors.primary : colors.hairline;
  const fillColor = isOver ? colors.caution : colors.primary;

  return (
    <View className="center" style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={fillColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <AnimatedCalorieValue remaining={remaining} />
    </View>
  );
}

function AnimatedCalorieValue({ remaining }: { remaining: number }) {
  const isOver = remaining < 0;
  return (
    <View className="center">
      <Text variant="metric-hero" tabular>
        {Math.abs(remaining).toLocaleString()}
      </Text>
      <Text variant="label-sm" color="mute">
        {isOver ? "kcal over" : "kcal left"}
      </Text>
    </View>
  );
}
