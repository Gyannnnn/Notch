import Feather from "@expo/vector-icons/Feather";
import { ActivityIndicator, Pressable, type PressableProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { cn } from "@/lib/cn";
import { colors, motion } from "@/theme/tokens";
import { Text } from "./Text";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const VARIANT = {
  primary: { container: "bg-ink", label: "on-ink" },
  secondary: { container: "bg-elevated border border-hairline-strong", label: "ink" },
  ghost: { container: "bg-transparent", label: "body" },
  destructive: { container: "bg-transparent", label: "error" },
} as const;

export type ButtonVariant = keyof typeof VARIANT;

interface ButtonProps extends Omit<PressableProps, "children" | "style"> {
  label: string;
  variant?: ButtonVariant;
  icon?: keyof typeof Feather.glyphMap;
  fullWidth?: boolean;
  loading?: boolean;
  className?: string;
}

export function Button({
  label,
  variant = "primary",
  icon,
  fullWidth,
  loading,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const { container, label: labelColor } = VARIANT[variant];
  const isInert = disabled || loading;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={isInert}
      onPressIn={() => scale.set(withSpring(0.97, motion.springPress))}
      onPressOut={() => scale.set(withSpring(1, motion.springPress))}
      className={cn(
        "center row tappable rounded-pill px-lg",
        container,
        fullWidth && "w-full",
        isInert && "opacity-50",
        className,
      )}
      style={[animatedStyle, { minHeight: variant === "ghost" ? 44 : 52 }]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors["on-ink"] : colors.ink} />
      ) : (
        <>
          {icon && (
            <Feather
              name={icon}
              size={18}
              color={colors[labelColor === "on-ink" ? "on-ink" : labelColor]}
              style={{ marginRight: 8 }}
            />
          )}
          <Text variant="button-lg" color={labelColor}>
            {label}
          </Text>
        </>
      )}
    </AnimatedPressable>
  );
}
