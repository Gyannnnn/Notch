import { useState } from "react";
import { LayoutChangeEvent, Pressable, View } from "react-native";
import { useAnimatedStyle, withTiming } from "react-native-reanimated";

import { MotionView } from "@/lib/animated";
import { motion, shadow } from "@/theme/tokens";
import { Text } from "./Text";

export interface Segment<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Sunken track with a white thumb that slides rather than jumps (DESIGN.md). */
export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const [trackWidth, setTrackWidth] = useState(0);
  const index = Math.max(
    0,
    segments.findIndex((s) => s.value === value),
  );
  const segmentWidth = trackWidth > 0 ? (trackWidth - 6) / segments.length : 0;

  const thumbStyle = useAnimatedStyle(() => ({
    width: segmentWidth,
    transform: [{ translateX: withTiming(index * segmentWidth, { duration: motion.quick }) }],
  }));

  const onLayout = (e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width);

  return (
    <View
      className="row rounded-pill bg-sunken"
      style={{ height: 40, padding: 3 }}
      onLayout={onLayout}
      accessibilityRole="tablist"
    >
      {/* Native shadow props, not `boxShadow`: this view's style is also
          written by Reanimated (`thumbStyle`) every frame it's sliding — see
          the `shadow` token's docblock in theme/tokens.ts. */}
      {segmentWidth > 0 && (
        <MotionView
          className="absolute rounded-pill bg-elevated"
          style={[{ top: 3, bottom: 3, left: 3 }, thumbStyle, shadow.whisper]}
        />
      )}
      {segments.map((segment) => {
        const active = segment.value === value;
        return (
          <Pressable
            key={segment.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(segment.value)}
            hitSlop={{ top: 2, bottom: 2 }}
            className="fill center"
          >
            <Text variant="label-md" color={active ? "ink" : "mute"}>
              {segment.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
