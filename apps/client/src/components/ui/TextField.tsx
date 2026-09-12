import { useState } from "react";
import { TextInput, View, type TextInputProps } from "react-native";

import { cn } from "@/lib/cn";
import { colors, fonts } from "@/theme/tokens";
import { Text } from "./Text";

interface TextFieldProps extends Omit<TextInputProps, "style" | "className"> {
  label?: string;
  /** Unit or short hint shown inside the field, right-aligned. */
  suffix?: string;
  hint?: string;
  className?: string;
}

/** Hairline-strong border that goes ink on focus. No filled variant (DESIGN.md). */
export function TextField({ label, suffix, hint, className, ...rest }: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View className={cn("gap-xxs", className)}>
      {label && (
        <Text variant="label-sm" color="mute">
          {label}
        </Text>
      )}
      <View
        className="row gap-xs rounded-sm bg-elevated px-md"
        style={{
          minHeight: 48,
          borderWidth: 1,
          borderColor: focused ? colors.ink : colors["hairline-strong"],
        }}
      >
        <TextInput
          className="fill text-ink"
          style={{
            fontFamily: fonts.regular,
            fontSize: 16,
            // Without this a text input keeps its intrinsic width and refuses
            // to shrink, overflowing narrow columns such as the macro trio.
            minWidth: 0,
            ...(rest.keyboardType === "decimal-pad" || rest.keyboardType === "number-pad"
              ? { fontVariant: ["tabular-nums" as const] }
              : {}),
          }}
          placeholderTextColor={colors.faint}
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
        />
        {suffix && (
          <Text variant="label-md" color="mute">
            {suffix}
          </Text>
        )}
      </View>
      {hint && (
        <Text variant="body-sm" color="mute">
          {hint}
        </Text>
      )}
    </View>
  );
}
