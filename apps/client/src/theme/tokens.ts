/**
 * Single source of truth for every design value in the app, transcribed from
 * DESIGN.md. Consumed twice:
 *   - tailwind.config.ts, which turns these into utility classes
 *   - directly in TS, for values className can't reach (SVG stroke/fill,
 *     Reanimated interpolations, Skia-free chart geometry)
 *
 * Change a value here and both paths follow. Never hardcode a hex or a pixel
 * value anywhere else.
 */

export const colors = {
  primary: "#3F6B52",
  "primary-deep": "#32553F",
  "primary-soft": "#E4EDE6",
  "on-primary": "#FFFFFF",

  ink: "#1C1A17",
  body: "#57524B",
  mute: "#767066",
  faint: "#B0A99E",
  "on-ink": "#FAF8F5",

  hairline: "#ECE7E0",
  "hairline-strong": "#DFD8CE",

  canvas: "#FAF8F5",
  elevated: "#FFFFFF",
  sunken: "#F2EEE8",
  scrim: "rgba(28,26,23,0.45)",

  caution: "#C08A3E",
  "caution-deep": "#8A5F22",
  "caution-soft": "#F7ECD9",

  positive: "#3F6B52",
  "positive-soft": "#E4EDE6",

  error: "#A33A2B",
  "error-deep": "#822E22",
  "error-soft": "#F6E4E0",

  "macro-protein": "#3F6B52",
  "macro-carbs": "#C08A3E",
  "macro-fat": "#7A6A94",

  "photo-scrim": "rgba(28,26,23,0.55)",
  "camera-guide": "rgba(250,248,245,0.55)",
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 40,
  "3xl": 56,
} as const;

export const radius = {
  none: 0,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 999,
  full: 9999,
} as const;

export const fonts = {
  regular: "PlusJakartaSans_400Regular",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
} as const;

/**
 * Each entry is one complete type style from DESIGN.md. tailwind.config.ts
 * expands these into `type-*` utilities, so a single class sets family, size,
 * line height and tracking together — they are never specified separately.
 */
export const typography = {
  "metric-hero": { font: fonts.bold, size: 56, leading: 60, tracking: -2 },
  "metric-lg": { font: fonts.bold, size: 32, leading: 38, tracking: -1 },
  "metric-md": { font: fonts.semibold, size: 22, leading: 28, tracking: -0.5 },
  "heading-lg": { font: fonts.bold, size: 26, leading: 32, tracking: -0.6 },
  "heading-md": { font: fonts.semibold, size: 19, leading: 26, tracking: -0.3 },
  "heading-sm": { font: fonts.semibold, size: 16, leading: 22, tracking: -0.2 },
  "body-lg": { font: fonts.regular, size: 16, leading: 24, tracking: 0 },
  "body-md": { font: fonts.regular, size: 14, leading: 20, tracking: 0 },
  "body-sm": { font: fonts.regular, size: 13, leading: 18, tracking: 0 },
  "label-md": { font: fonts.semibold, size: 14, leading: 18, tracking: -0.1 },
  "label-sm": { font: fonts.semibold, size: 12, leading: 16, tracking: 0.2 },
  overline: { font: fonts.semibold, size: 11, leading: 14, tracking: 0.8, uppercase: true },
  "button-lg": { font: fonts.semibold, size: 16, leading: 20, tracking: -0.1 },
  "button-md": { font: fonts.semibold, size: 14, leading: 18, tracking: -0.1 },
} as const;

/**
 * boxShadow strings rather than legacy shadow/elevation props: one value covers
 * both platforms. Tinted to ink rather than black so shadows stay warm (DESIGN.md).
 */
export const elevation = {
  whisper: { boxShadow: "0 1px 2px rgba(28, 26, 23, 0.04)" },
  raised: { boxShadow: "0 2px 8px rgba(28, 26, 23, 0.06)" },
  floating: { boxShadow: "0 8px 24px rgba(28, 26, 23, 0.1)" },
} as const;

/**
 * Pairs with every non-capsule radius. A continuous curve reads softer than a
 * circular one at the same value, which is the cheapest reinforcement of the
 * "calm rather than technical" shape language. Capsules keep the default curve.
 */
export const curve = { borderCurve: "continuous" } as const;

export const motion = {
  instant: 120,
  quick: 180,
  standard: 260,
  expressive: 420,
  ringFill: 900,
  springPress: { damping: 18, stiffness: 320 },
  springDrag: { damping: 26, stiffness: 180 },
} as const;

export type ColorToken = keyof typeof colors;
export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radius;
export type TypographyToken = keyof typeof typography;
