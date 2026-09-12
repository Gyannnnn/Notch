import { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { motion } from "@/theme/tokens";

/**
 * The app's single press treatment: a spring scale on press-in, released on
 * press-out. Scale carries the label and icons with it, which is what makes a
 * press read as physical — an opacity fade only dims it.
 *
 * Spread onto an `AnimatedPressable` (from `@/lib/animated`, which carries the
 * className interop):
 *
 *     const press = usePressScale();
 *     <AnimatedPressable {...press.handlers} style={press.style} />
 *
 * The scale is written and read only inside worklets and handlers, never during
 * render, and uses get/set rather than `.value` so the React Compiler can see
 * through it (it is enabled in app.json).
 */
export function usePressScale(to = 0.97) {
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  const handlers = {
    onPressIn: () => scale.set(withSpring(to, motion.springPress)),
    onPressOut: () => scale.set(withSpring(1, motion.springPress)),
  };

  return { style, handlers };
}
