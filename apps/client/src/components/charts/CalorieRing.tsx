import { useEffect, useRef } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

import { Text } from "@/components/ui/Text";
import { MotionTextInput } from "@/lib/animated";
import { colors, fonts, motion, typography } from "@/theme/tokens";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * Thousands separators, worklet-safe. `toLocaleString` is not available on the
 * UI runtime, and the counter has to format every frame there. Grouping is
 * three-digit because every string in the app is written in English.
 */
function group(value: number) {
  "worklet";
  const digits = String(value);
  let out = "";
  for (let i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += ",";
    out += digits[i];
  }
  return out;
}

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
  const magnitude = Math.abs(remaining);

  const reduced = useReducedMotion();

  // Arc and digits are two values animated with one config, so they land
  // together. They track the real numbers rather than a 0-to-1 reveal, so an
  // update counts from the previous total instead of restarting from zero.
  // Reduced motion starts at the answer rather than animating to it, so there is
  // no frame of "0" before the effect runs.
  const arc = useSharedValue(reduced ? sweep : 0);
  const count = useSharedValue(reduced ? magnitude : 0);
  const mounted = useRef(false);

  useEffect(() => {
    const first = !mounted.current;
    mounted.current = true;

    if (reduced) {
      arc.set(sweep);
      count.set(magnitude);
      return;
    }
    // 900ms to introduce the ring, 260ms to acknowledge a log (DESIGN.md motion).
    const config = {
      duration: first ? motion.ringFill : motion.standard,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    };
    arc.set(withTiming(sweep, config));
    count.set(withTiming(magnitude, config));
  }, [sweep, magnitude, reduced, arc, count]);

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - arc.get()),
  }));

  const countProps = useAnimatedProps(
    () => ({ text: group(Math.round(count.get())) }) as never,
  );

  // Once past target the base ring reads as "full", with the second lap on top.
  const trackColor = isOver ? colors.primary : colors.hairline;
  const fillColor = isOver ? colors.caution : colors.primary;

  return (
    <View
      className="center"
      style={{ width: size, height: size }}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={
        isOver
          ? `${magnitude} kcal over your ${target} target`
          : `${magnitude} kcal left of ${target}`
      }
      accessibilityValue={{ min: 0, max: target, now: Math.round(consumed) }}
    >
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
          animatedProps={ringProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View className="center" importantForAccessibility="no-hide-descendants">
        <MotionTextInput
          editable={false}
          pointerEvents="none"
          defaultValue={group(reduced ? magnitude : 0)}
          animatedProps={countProps}
          className="text-ink"
          style={{
            fontFamily: fonts.bold,
            fontSize: typography["metric-hero"].size,
            lineHeight: typography["metric-hero"].leading,
            letterSpacing: typography["metric-hero"].tracking,
            fontVariant: ["tabular-nums"],
            width: size,
            padding: 0,
            textAlign: "center",
          }}
        />
        <Text variant="label-sm" color="mute">
          {isOver ? "kcal over" : "kcal left"}
        </Text>
      </View>
    </View>
  );
}
