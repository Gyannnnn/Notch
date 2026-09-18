import Feather from "@expo/vector-icons/Feather";
import { ActivityIndicator, type PressableProps } from "react-native";

import { usePressScale } from "@/hooks/usePressScale";
import { MotionPressable } from "@/lib/animated";
import { cn } from "@/lib/cn";
import { colors } from "@/theme/tokens";
import { Text } from "./Text";

const VARIANT = {
  primary: { container: "bg-ink", label: "on-ink" },
  secondary: { container: "bg-elevated border border-hairline-strong", label: "ink" },
  ghost: { container: "bg-transparent", label: "body" },
  destructive: { container: "bg-transparent", label: "error" },
} as const;

export type ButtonVariant = keyof typeof VARIANT;

/**
 * `md` is the standard call to action. `sm` is for a button that shares a row
 * with other content rather than owning one — it has to give up width, so it
 * drops to the smaller label size and the tighter gutter.
 */
const SIZE = {
  md: { padding: "px-lg", label: "button-lg", height: 52, icon: 18, gap: 8 },
  sm: { padding: "px-md", label: "button-md", height: 44, icon: 16, gap: 6 },
} as const;

export type ButtonSize = keyof typeof SIZE;

interface ButtonProps extends Omit<PressableProps, "children" | "style"> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Feather.glyphMap;
  fullWidth?: boolean;
  loading?: boolean;
  className?: string;
}

export function Button({
  label,
  variant = "primary",
  size = "md",
  icon,
  fullWidth,
  loading,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const press = usePressScale();
  const { container, label: labelColor } = VARIANT[variant];
  const metrics = SIZE[size];
  const isInert = disabled || loading;

  return (
    <MotionPressable
      accessibilityRole="button"
      disabled={isInert}
      {...press.handlers}
      className={cn(
        "center row tappable rounded-pill",
        metrics.padding,
        container,
        fullWidth && "w-full",
        isInert && "opacity-50",
        className,
      )}
      style={[press.style, { minHeight: variant === "ghost" ? 44 : metrics.height }]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors["on-ink"] : colors.ink} />
      ) : (
        <>
          {icon && (
            <Feather
              name={icon}
              size={metrics.icon}
              color={colors[labelColor === "on-ink" ? "on-ink" : labelColor]}
              style={{ marginRight: metrics.gap }}
            />
          )}
          <Text variant={metrics.label} color={labelColor} numberOfLines={1}>
            {label}
          </Text>
        </>
      )}
    </MotionPressable>
  );
}
