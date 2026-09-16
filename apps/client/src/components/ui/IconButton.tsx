import Feather from "@expo/vector-icons/Feather";
import type { PressableProps } from "react-native";

import { usePressScale } from "@/hooks/usePressScale";
import { MotionPressable } from "@/lib/animated";
import { cn } from "@/lib/cn";
import { colors, shadow } from "@/theme/tokens";

const SIZE = 44;

interface IconButtonProps extends Omit<PressableProps, "children" | "style"> {
  icon: keyof typeof Feather.glyphMap;
  /** Required — there's no visible label to fall back on for a11y. */
  accessibilityLabel: string;
  className?: string;
}

/**
 * `button-icon-circular` from DESIGN.md: a 44px white circle with a hairline
 * border, for header actions and carousel controls.
 *
 * Explicit half-size `borderRadius` (not `rounded-full`) plus the native
 * `shadow.*` prop (not the `boxShadow`-based `elevation.*`) — the same
 * Android-safe pattern used by the tab-bar FAB, Card, Switch's thumb, and
 * ComparisonSlider's handle. See the doc-block on `shadow` in tokens.ts.
 */
export function IconButton({ icon, disabled, className, ...rest }: IconButtonProps) {
  const press = usePressScale();

  return (
    <MotionPressable
      accessibilityRole="button"
      disabled={disabled}
      {...press.handlers}
      className={cn("center border border-hairline bg-elevated", disabled && "opacity-50", className)}
      style={[press.style, shadow.whisper, { width: SIZE, height: SIZE, borderRadius: SIZE / 2 }]}
      {...rest}
    >
      <Feather name={icon} size={20} color={colors.ink} />
    </MotionPressable>
  );
}
