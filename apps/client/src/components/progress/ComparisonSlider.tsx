import Feather from "@expo/vector-icons/Feather";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  clamp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
} from "react-native-reanimated";

import { Text } from "@/components/ui/Text";
import { MotionView } from "@/lib/animated";
import { colors, radius, shadow, spacing } from "@/theme/tokens";

const HANDLE = 52;
const LINE = 3;

interface ComparisonSliderProps {
  beforeUri: string | number;
  afterUri: string | number;
  aspectRatio?: number;
  /** Off when the frame's corners are already clipped by a parent card. */
  rounded?: boolean;
  /** Captions drawn on the photo, e.g. "19 Aug". Omitted, no captions show. */
  beforeLabel?: string;
  afterLabel?: string;
}

/**
 * The most-polished interaction in the app. The divider tracks the finger 1:1
 * and carries momentum on release — never stepped, never snapped. All of it
 * runs on the UI thread; no per-frame setState.
 *
 * Position is held as a 0-1 fraction rather than a pixel offset, so it is right
 * from the very first frame and stays right through every layout pass. The
 * pixel version had to be seeded from `onLayout`, which meant one bad or late
 * layout report left the divider parked off-frame with nothing to correct it.
 *
 * Every element that Reanimated writes to is a `MotionView` with plain style
 * objects — see the docblock in lib/animated.ts for why a `className` on one of
 * these would silently erase its own layout.
 */
export function ComparisonSlider({
  beforeUri,
  afterUri,
  aspectRatio = 0.8,
  rounded = true,
  beforeLabel,
  afterLabel,
}: ComparisonSliderProps) {
  const [width, setWidth] = useState(0);
  const progress = useSharedValue(0.5);
  const start = useSharedValue(0.5);

  const bump = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  const pan = Gesture.Pan()
    // Let the enclosing ScrollView keep vertical drags: the slider only claims
    // the gesture once it is clearly horizontal.
    .activeOffsetX([-8, 8])
    .failOffsetY([-14, 14])
    .onBegin(() => {
      start.set(progress.get());
    })
    .onUpdate((e) => {
      const span = Math.max(width, 1);
      const next = clamp(start.get() + e.translationX / span, 0, 1);
      if ((next === 0 || next === 1) && progress.get() !== next) runOnJS(bump)();
      progress.set(next);
    })
    .onEnd((e) => {
      progress.set(
        withDecay({
          velocity: e.velocityX / Math.max(width, 1),
          clamp: [0, 1],
          deceleration: 0.997,
        }),
      );
    });

  // `width` is a dependency, not a shared value: when layout settles the styles
  // recompute against the real width instead of racing a one-shot initialiser.
  const revealStyle = useAnimatedStyle(() => ({ width: progress.get() * width }), [width]);
  const handleStyle = useAnimatedStyle(
    () => ({ transform: [{ translateX: progress.get() * width - HANDLE / 2 }] }),
    [width],
  );

  return (
    <GestureDetector gesture={pan}>
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="Before and after comparison"
        accessibilityHint="Swipe left or right to wipe between the two photos"
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={(e) =>
          progress.set(
            clamp(progress.get() + (e.nativeEvent.actionName === "increment" ? 0.1 : -0.1), 0, 1),
          )
        }
        style={[
          styles.frame,
          { aspectRatio },
          rounded && { borderRadius: radius.lg, borderCurve: "continuous" },
        ]}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      >
        <Image source={afterUri} style={StyleSheet.absoluteFill} contentFit="cover" />

        <MotionView style={[styles.reveal, revealStyle]}>
          <Image source={beforeUri} style={{ width, height: "100%" }} contentFit="cover" />
        </MotionView>

        {(beforeLabel || afterLabel) && (
          <View style={styles.captions} pointerEvents="none">
            <Caption text={beforeLabel} tag="Before" />
            <Caption text={afterLabel} tag="After" />
          </View>
        )}

        <MotionView style={[styles.handleTrack, handleStyle]} pointerEvents="none">
          <View style={styles.line} />
          {/* Explicit half-size radius (not a 9999 pill) and the native
              `shadow.*` props rather than the `boxShadow`-based `elevation.*` —
              see the tab-fab note in DESIGN.md. */}
          <View style={styles.knob}>
            <Feather name="chevron-left" size={16} color={colors.ink} />
            <Feather name="chevron-right" size={16} color={colors.ink} />
          </View>
        </MotionView>
      </View>
    </GestureDetector>
  );
}

function Caption({ text, tag }: { text?: string; tag: string }) {
  if (!text) return <View />;
  return (
    <View style={styles.caption}>
      <Text variant="overline" color="on-ink" style={{ opacity: 0.7 }}>
        {tag}
      </Text>
      <Text variant="label-sm" color="on-ink" tabular>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: colors.ink,
  },
  reveal: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    overflow: "hidden",
  },
  captions: {
    position: "absolute",
    left: spacing.sm,
    right: spacing.sm,
    bottom: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  caption: {
    borderRadius: radius.xs,
    backgroundColor: colors["photo-scrim"],
    paddingHorizontal: spacing.xs,
    paddingVertical: 5,
  },
  handleTrack: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: HANDLE,
    alignItems: "center",
    justifyContent: "center",
  },
  line: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: LINE,
    backgroundColor: colors.elevated,
  },
  knob: {
    width: HANDLE,
    height: HANDLE,
    borderRadius: HANDLE / 2,
    backgroundColor: colors.elevated,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...shadow.floating,
  },
});
