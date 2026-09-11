import { View } from "react-native";

import { cn } from "@/lib/cn";
import { Text } from "./Text";
import type { TextColor } from "./Text";

/**
 * `caution` is the strongest tone available here on purpose — severity about a
 * user's own behaviour stops at clay, and never reaches error red (DESIGN.md).
 */
const TONE = {
  neutral: { container: "bg-sunken", label: "mute" },
  positive: { container: "bg-primary-soft", label: "primary-deep" },
  caution: { container: "bg-caution-soft", label: "caution-deep" },
} satisfies Record<string, { container: string; label: TextColor }>;

export type BadgeTone = keyof typeof TONE;

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  uppercase?: boolean;
  className?: string;
}

export function Badge({ label, tone = "neutral", uppercase = false, className }: BadgeProps) {
  const { container, label: labelColor } = TONE[tone];
  return (
    <View
      className={cn("center rounded-pill px-xs", container, className)}
      style={{ minHeight: 24 }}
    >
      <Text variant={uppercase ? "overline" : "label-sm"} color={labelColor}>
        {label}
      </Text>
    </View>
  );
}
