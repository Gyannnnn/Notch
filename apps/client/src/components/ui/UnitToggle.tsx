import { Pressable, View } from "react-native";

import { cn } from "@/lib/cn";
import { Text } from "./Text";

interface UnitToggleProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  className?: string;
}

/** Sits next to the value it governs, never buried in settings (DESIGN.md). */
export function UnitToggle<T extends string>({
  value,
  options,
  onChange,
  className,
}: UnitToggleProps<T>) {
  return (
    <View
      className={cn("row self-start rounded-pill bg-sunken", className)}
      style={{ height: 32, padding: 3 }}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            hitSlop={{ top: 6, bottom: 6 }}
            className={`center rounded-pill px-sm ${active ? "bg-elevated" : ""}`}
          >
            <Text variant="label-sm" color={active ? "ink" : "mute"}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
