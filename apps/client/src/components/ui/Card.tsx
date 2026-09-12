import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";

import { usePressScale } from "@/hooks/usePressScale";
import { AnimatedPressable } from "@/lib/animated";
import { cn } from "@/lib/cn";
import { curve, elevation } from "@/theme/tokens";

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
  const shadow = raised ? elevation.raised : elevation.whisper;

  if (onPress) {
    return (
      <AnimatedPressable
        accessibilityRole="button"
        onPress={onPress}
        {...press.handlers}
        className={classes}
        style={[curve, shadow, press.style, style]}
        {...rest}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <View className={classes} style={[curve, shadow, style]} {...rest}>
      {children}
    </View>
  );
}
