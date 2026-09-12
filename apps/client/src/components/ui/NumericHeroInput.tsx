import { TextInput, View } from "react-native";

import { cn } from "@/lib/cn";
import { colors, fonts, typography } from "@/theme/tokens";
import { Text } from "./Text";

/**
 * Plus Jakarta's tabular figures are a fixed advance width, so at 56px a digit
 * is a known size and the field can be sized from its own value. Leaving the
 * input to size itself instead gives a platform-dependent box — on web an
 * `<input>` defaults to roughly twenty characters — which strands the unit far
 * out to the right of the number it belongs to.
 */
const DIGIT_WIDTH = 32;
const MIN_WIDTH = 64;

const widthFor = (value: string) => Math.max(MIN_WIDTH, value.length * DIGIT_WIDTH);

interface NumericHeroInputProps {
  value: string;
  onChangeText: (value: string) => void;
  /** The unit, as a mute suffix beside the value. */
  suffix: string;
  autoFocus?: boolean;
  className?: string;
}

/** The weight-entry and onboarding field. Borderless; nothing competes with it. */
export function NumericHeroInput({
  value,
  onChangeText,
  suffix,
  autoFocus,
  className,
}: NumericHeroInputProps) {
  return (
    <View className={cn("row items-baseline gap-xs", className)}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
        selectTextOnFocus
        autoFocus={autoFocus}
        className="text-ink"
        style={{
          fontFamily: fonts.bold,
          fontSize: typography["metric-hero"].size,
          lineHeight: typography["metric-hero"].leading,
          letterSpacing: typography["metric-hero"].tracking,
          fontVariant: ["tabular-nums"],
          width: widthFor(value),
          padding: 0,
          textAlign: "right",
        }}
        placeholderTextColor={colors.faint}
      />
      <Text variant="heading-md" color="mute">
        {suffix}
      </Text>
    </View>
  );
}
