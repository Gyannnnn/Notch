import type { ReactNode } from "react";
import { Pressable, View, type ViewProps } from "react-native";

import { cn } from "@/lib/cn";
import { elevation } from "@/theme/tokens";

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
  const classes = cn(
    "rounded-lg border border-hairline bg-elevated",
    padded && "p-md",
    className,
  );
  const shadow = raised ? elevation.raised : elevation.whisper;

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        className={cn(classes, "active:opacity-90")}
        style={[shadow, style]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View className={classes} style={[shadow, style]} {...rest}>
      {children}
    </View>
  );
}
