import { Pressable } from "react-native";

import { cn } from "@/lib/cn";
import { colors } from "@/theme/tokens";
import { Text } from "./Text";

interface ChoiceCardProps {
  title: string;
  body: string;
  selected: boolean;
  onPress: () => void;
  /** Shorter card for longer lists, such as the five activity levels. */
  compact?: boolean;
  className?: string;
}

/**
 * DESIGN.md `choice-card` — the Cut / Bulk / Maintain and activity-level cards.
 * Selection is a 2px ink border, never a fill and never a checkmark, so the
 * card reads the same whether or not it is chosen.
 */
export function ChoiceCard({
  title,
  body,
  selected,
  onPress,
  compact,
  className,
}: ChoiceCardProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={cn("justify-center rounded-lg bg-elevated p-md", className)}
      style={{
        minHeight: compact ? 64 : 76,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? colors.ink : colors["hairline-strong"],
      }}
    >
      <Text variant="heading-md">{title}</Text>
      <Text variant="body-sm" color="mute">
        {body}
      </Text>
    </Pressable>
  );
}
