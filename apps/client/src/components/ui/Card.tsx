import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";

import { usePressScale } from "@/hooks/usePressScale";
import { AnimatedPressable } from "@/lib/animated";
import { cn } from "@/lib/cn";
import { curve, shadow } from "@/theme/tokens";

interface CardProps extends ViewProps {
  children: ReactNode;
  onPress?: () => void;
  /** Cards sit at whisper by default; sheets and the FAB are the floating ones. */
  raised?: boolean;
  padded?: boolean;
  className?: string;
}

export function Card({
  children,
  onPress,
  raised = false,
  padded = true,
  className,
  style,
  ...rest
}: CardProps) {
  const press = usePressScale();
  const classes = cn(
    "rounded-lg border border-hairline bg-elevated",
    padded && "p-md",
    className,
  );
  // Native `elevation`/`shadow*` props, not the `boxShadow`-based `elevation`
  // token: this view's own style is also written by Reanimated (`press.style`)
  // whenever onPress is set, and combining a `boxShadow` with a per-frame
  // Reanimated write on one view is what made the tab-bar FAB render
  // invisible-but-tappable on Android (theme/tokens.ts, `shadow`'s docblock).
  const cardShadow = raised ? shadow.raised : shadow.whisper;

  if (onPress) {
    return (
      <AnimatedPressable
        accessibilityRole="button"
        onPress={onPress}
        {...press.handlers}
        className={classes}
        style={[curve, cardShadow, press.style, style]}
        {...rest}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <View className={classes} style={[curve, cardShadow, style]} {...rest}>
      {children}
    </View>
  );
}
