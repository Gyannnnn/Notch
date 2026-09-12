import { Pressable } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";

import { colors, elevation, motion } from "@/theme/tokens";

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label: string;
  disabled?: boolean;
}

const TRACK_WIDTH = 51;
const TRACK_HEIGHT = 31;
const THUMB = 27;

/**
 * Sage when on — the one place besides the centre FAB where a sage fill means
 * "active" rather than "status". Off is the sunken track, not a red or empty
 * state: a reminder the user hasn't enabled is not a problem to flag.
 */
export function Switch({ value, onValueChange, label, disabled }: SwitchProps) {
  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(value ? colors.primary : colors.sunken, {
      duration: motion.quick,
    }),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: withTiming(value ? TRACK_WIDTH - THUMB - 4 : 0, { duration: motion.quick }) },
    ],
  }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      hitSlop={10}
    >
      <Animated.View
        className="justify-center rounded-pill"
        style={[
          { width: TRACK_WIDTH, height: TRACK_HEIGHT, padding: 2, opacity: disabled ? 0.5 : 1 },
          trackStyle,
        ]}
      >
        <Animated.View
          className="rounded-full bg-elevated"
          style={[{ width: THUMB, height: THUMB }, elevation.raised, thumbStyle]}
        />
      </Animated.View>
    </Pressable>
  );
}
