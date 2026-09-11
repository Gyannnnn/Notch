import { Text as RNText, type TextProps } from "react-native";

import type { TypographyToken } from "@/theme/tokens";
import { cn } from "@/lib/cn";

/**
 * Tailwind only emits classes it can find as literal strings in source, so
 * these maps spell each one out. `satisfies` makes the typography map fail to
 * compile if a token is added to tokens.ts without a class here.
 */
const TYPE_CLASS = {
  "metric-hero": "type-metric-hero",
  "metric-lg": "type-metric-lg",
  "metric-md": "type-metric-md",
  "heading-lg": "type-heading-lg",
  "heading-md": "type-heading-md",
  "heading-sm": "type-heading-sm",
  "body-lg": "type-body-lg",
  "body-md": "type-body-md",
  "body-sm": "type-body-sm",
  "label-md": "type-label-md",
  "label-sm": "type-label-sm",
  overline: "type-overline",
  "button-lg": "type-button-lg",
  "button-md": "type-button-md",
} satisfies Record<TypographyToken, string>;

const COLOR_CLASS = {
  ink: "text-ink",
  body: "text-body",
  mute: "text-mute",
  faint: "text-faint",
  "on-ink": "text-on-ink",
  "on-primary": "text-on-primary",
  primary: "text-primary",
  "primary-deep": "text-primary-deep",
  caution: "text-caution",
  "caution-deep": "text-caution-deep",
  error: "text-error",
};

export type TextColor = keyof typeof COLOR_CLASS;

export interface AppTextProps extends TextProps {
  variant?: TypographyToken;
  color?: TextColor;
  /** Locks numeral width so counting values don't reflow (DESIGN.md). */
  tabular?: boolean;
}

export function Text({
  variant = "body-md",
  color = "ink",
  tabular,
  className,
  style,
  ...rest
}: AppTextProps) {
  return (
    <RNText
      className={cn(TYPE_CLASS[variant], COLOR_CLASS[color], className)}
      style={[tabular && { fontVariant: ["tabular-nums"] }, style]}
      {...rest}
    />
  );
}
