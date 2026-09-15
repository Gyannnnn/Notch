import { Pressable, View } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";

import { colors, motion, shadow } from "@/theme/tokens";

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
        {/* The animated position (thumbStyle) and the shadow live on different
            views. Putting `boxShadow` and a per-frame Reanimated write on the
            same view is what made the tab-bar FAB render invisible-but-tappable
            on Android (see TabBar.tsx); this thumb had the identical pattern, so
            it gets the identical fix — plus the explicit half-size radius, since
            `rounded-full` (9999px) under a shadow was the first, insufficient
            attempt there too (DESIGN.md, tab-fab note). */}
        <Animated.View style={[{ width: THUMB, height: THUMB }, thumbStyle]}>
          <View
            style={[
              {
                width: THUMB,
                height: THUMB,
                borderRadius: THUMB / 2,
                backgroundColor: colors.elevated,
              },
              shadow.raised,
            ]}
          />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}
