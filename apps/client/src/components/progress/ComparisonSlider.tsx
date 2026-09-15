import Feather from "@expo/vector-icons/Feather";
import { Image } from "expo-image";
import { useState } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  clamp,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
} from "react-native-reanimated";

import { colors, shadow } from "@/theme/tokens";

interface ComparisonSliderProps {
  beforeUri: string | number;
  afterUri: string | number;
  aspectRatio?: number;
}

/**
 * The most-polished interaction in the app. The divider tracks the finger 1:1
 * and carries momentum on release — never stepped, never snapped. All of it
 * runs on the UI thread; no per-frame setState.
 */
export function ComparisonSlider({
  beforeUri,
  afterUri,
  aspectRatio = 0.75,
}: ComparisonSliderProps) {
  const [width, setWidth] = useState(0);
  const divider = useSharedValue(0);
  const startX = useSharedValue(0);

  const pan = Gesture.Pan()
    .onBegin(() => {
      startX.value = divider.value;
    })
    .onUpdate((e) => {
      divider.value = clamp(startX.value + e.translationX, 0, width);
    })
    .onEnd((e) => {
      divider.value = withDecay({
        velocity: e.velocityX,
        clamp: [0, width],
        deceleration: 0.997,
      });
    });

  // Drag works anywhere on the photo, not just on the handle.
  const revealStyle = useAnimatedStyle(() => ({ width: divider.value }));
  const handleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: divider.value - 22 }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <View
        className="overflow-hidden rounded-lg bg-ink"
        style={{ width: "100%", aspectRatio }}
        onLayout={(e) => {
          const next = e.nativeEvent.layout.width;
          setWidth(next);
          if (divider.get() === 0) divider.set(next / 2);
        }}
      >
        <Image source={afterUri} style={{ width: "100%", height: "100%" }} contentFit="cover" />

        <Animated.View
          className="absolute bottom-0 left-0 top-0 overflow-hidden"
          style={revealStyle}
        >
          <Image
            source={beforeUri}
            style={{ width, height: "100%" }}
            contentFit="cover"
          />
        </Animated.View>

        <Animated.View
          className="absolute bottom-0 top-0 items-center justify-center"
          style={[{ width: 44 }, handleStyle]}
          pointerEvents="none"
        >
          <View
            className="absolute bottom-0 top-0 bg-elevated"
            style={{ width: 2, left: 21 }}
          />
          {/* Explicit half-size radius (not `rounded-full`) and the native `shadow.*`
              props (not the `boxShadow`-based `elevation.*`) — see the tab-fab note
              in DESIGN.md. This view's own style is already static — the transform
              lives on the animated ancestor above — so it only needed this swap. */}
          <View
            className="center"
            style={[
              { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.elevated },
              shadow.floating,
            ]}
          >
            <Feather name="move" size={18} color={colors.ink} />
          </View>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}
