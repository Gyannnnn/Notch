import { Pressable } from "react-native";

import { cn } from "@/lib/cn";
import { Text } from "./Text";

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  className?: string;
}

export function Chip({ label, selected = false, onPress, className }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      hitSlop={{ top: 4, bottom: 4 }}
      className={cn(
        "center row rounded-pill border px-md",
        selected ? "border-ink bg-ink" : "border-hairline-strong bg-elevated",
        className,
      )}
      style={{ minHeight: 36 }}
    >
      <Text variant="label-md" color={selected ? "on-ink" : "body"}>
        {label}
      </Text>
    </Pressable>
  );
}
