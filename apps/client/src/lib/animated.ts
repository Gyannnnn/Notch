import { cssInterop } from "nativewind";
import { createElement, forwardRef, type ComponentType, type Ref } from "react";
import {
  Pressable,
  ScrollView,
  Text as RNText,
  TextInput,
  View,
  type PressableProps,
  type ScrollViewProps,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import Animated, { type AnimatedProps } from "react-native-reanimated";

/**
 * Reanimated components that can also carry a `className`.
 *
 * They exist because NativeWind and Reanimated cannot share one element's
 * `style` prop. NativeWind's JSX interop collapses every entry of `style` into
 * a single object (`applyRules` -> `assignToTarget` in react-native-css-interop),
 * and a `useAnimatedStyle()` handle spread into that object keeps its
 * `viewDescriptors` field. Reanimated's `PropsFilter` then recognises the
 * *merged* object as an animated style and replaces it wholesale with the
 * updater's initial value — silently dropping every class-derived style on that
 * element. That is why a pressable Card rendered with no background, border or
 * radius, why IconButton lost its white circle, and why ComparisonSlider's
 * reveal and handle disappeared completely (both were positioned by classes
 * the interop threw away).
 *
 * The fix is to keep the animated style out of the interop entirely. NativeWind
 * writes `className` into `classStyle` — a prop it owns outright and never sees
 * an animated handle in — and the base component below composes
 * `[classStyle, style]` onto a raw Reanimated element, reached through
 * `createElement` so NativeWind's JSX wrapper never swaps it for an interop
 * version. Class styles go first, so an inline or animated style still wins,
 * exactly as it would on any other React Native component.
 *
 * Use these anywhere an element needs both a className and a `useAnimatedStyle`
 * result. A bare `<Animated.View>` carrying only `entering`/`exiting` and plain
 * style objects is unaffected, but prefer these there too so there is one path.
 */
type ClassStyleProps = { classStyle?: StyleProp<ViewStyle & TextStyle> };

function motion<P extends { style?: unknown }>(Component: ComponentType<P>, name: string) {
  const Base = forwardRef<unknown, P & ClassStyleProps>(function MotionBase(
    { classStyle, style, ...rest },
    ref,
  ) {
    return createElement(Component as ComponentType<Record<string, unknown>>, {
      ...(rest as Record<string, unknown>),
      ref,
      style: [classStyle, style],
    });
  });
  Base.displayName = `${name}Base`;
  return cssInterop(Base as unknown as ComponentType<ClassStyleProps>, { className: "classStyle" });
}

type Styled<P, S, R> = Omit<P, "style"> & {
  className?: string;
  style?: StyleProp<S> | AnimatedProps<{ style?: StyleProp<S> }>["style"];
  ref?: Ref<R>;
};

export const MotionView = motion(Animated.View, "MotionView") as ComponentType<
  Styled<AnimatedProps<ViewProps>, ViewStyle, View>
>;

export const MotionText = motion(Animated.Text, "MotionText") as ComponentType<
  Styled<AnimatedProps<TextProps>, TextStyle, RNText>
>;

export const MotionScrollView = motion(
  Animated.ScrollView,
  "MotionScrollView",
) as ComponentType<Styled<AnimatedProps<ScrollViewProps>, ViewStyle, ScrollView>>;

/**
 * Shared so the interop is registered exactly once. Creating a second animated
 * Pressable in a component file would produce an unregistered component that
 * drops className again.
 */
export const MotionPressable = motion(
  Animated.createAnimatedComponent(Pressable),
  "MotionPressable",
) as ComponentType<Styled<AnimatedProps<PressableProps>, ViewStyle, View>>;

/**
 * A number that animates its own digits. `Animated.Text` only accepts TextProps,
 * which carry no animatable text, so a counter built on it has to re-render on
 * every frame; TextInput exposes a native `text` prop that `useAnimatedProps`
 * can drive from the UI thread instead, leaving React out of the loop entirely.
 * Always non-editable and hidden from screen readers — the labelled parent
 * carries the value.
 */
export const MotionTextInput = motion(
  Animated.createAnimatedComponent(TextInput),
  "MotionTextInput",
) as ComponentType<Styled<AnimatedProps<TextInputProps>, TextStyle, TextInput>>;
