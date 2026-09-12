import Feather from "@expo/vector-icons/Feather";
import { Pressable, View } from "react-native";

import { colors } from "@/theme/tokens";
import { Text } from "./Text";

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  /** Rolls past the ends instead of stopping — for cyclic values like hours. */
  wrap?: boolean;
  /** Raise so sibling steppers stay the same width despite shorter labels. */
  valueMinWidth?: number;
  format?: (value: number) => string;
}

export function Stepper({
  value,
  onChange,
  step = 0.5,
  min = step,
  max = 20,
  wrap = false,
  valueMinWidth = 72,
  format = (v) => String(v),
}: StepperProps) {
  const clamp = (next: number) => {
    const snapped = Math.round(next / step) * step;
    if (!wrap) return Math.min(max, Math.max(min, snapped));
    const span = max - min + step;
    return min + (((snapped - min) % span) + span) % span;
  };

  return (
    <View className="row rounded-pill bg-sunken" style={{ height: 44, padding: 3 }}>
      <StepButton icon="minus" label="Decrease" onPress={() => onChange(clamp(value - step))} />
      <View className="center px-sm" style={{ minWidth: valueMinWidth }}>
        <Text variant="metric-md" tabular>
          {format(value)}
        </Text>
      </View>
      <StepButton icon="plus" label="Increase" onPress={() => onChange(clamp(value + step))} />
    </View>
  );
}

function StepButton({
  icon,
  label,
  onPress,
}: {
  icon: "plus" | "minus";
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={3}
      className="center rounded-full bg-elevated active:opacity-70"
      style={{ width: 38, height: 38 }}
    >
      <Feather name={icon} size={18} color={colors.ink} />
    </Pressable>
  );
}
