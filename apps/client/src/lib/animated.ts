import { cssInterop } from "nativewind";
import { Pressable, TextInput } from "react-native";
import Animated from "react-native-reanimated";

/**
 * NativeWind ships interop mappings for React Native's own components and for
 * react-native-safe-area-context, but not for Reanimated. Without these an
 * `<Animated.View className="row gap-xs">` silently drops the class and lays
 * out as an unstyled column — so registering them once, here, is what makes
 * className work on every animated element in the app.
 *
 * This module is imported for its side effect by the root layout, before any
 * screen renders.
 */
cssInterop(Animated.View, { className: "style" });
cssInterop(Animated.Text, { className: "style" });
cssInterop(Animated.ScrollView, {
  className: "style",
  contentContainerClassName: "contentContainerStyle",
});

/**
 * Shared so the interop is registered exactly once. Creating a second animated
 * Pressable in a component file would produce an unregistered component that
 * drops className again.
 */
export const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
cssInterop(AnimatedPressable, { className: "style" });

/**
 * A number that animates its own digits. `Animated.Text` only accepts TextProps,
 * which carry no animatable text, so a counter built on it has to re-render on
 * every frame; TextInput exposes a native `text` prop that `useAnimatedProps`
 * can drive from the UI thread instead, leaving React out of the loop entirely.
 * Always non-editable and hidden from screen readers — the labelled parent
 * carries the value.
 */
export const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
cssInterop(AnimatedTextInput, { className: "style" });
