---
version: v1
name: Mobile Client Design System
description: "The design system for this repo's Expo React Native client — a calm, warm, near-monochrome system built for a progress-photo and food-logging app. A warm off-white ground (#FAF8F5) carries warm near-black ink (#1C1A17), structure comes from 1px warm hairlines before shadows, and a single calm sage accent (#3F6B52) is the only saturated color in everyday use. Plus Jakarta Sans sets everything from the 56px hero calorie number down to 11px overlines. Severity is deliberately capped — a warm clay caution tone is the strongest signal the app will show a user about their own behavior, and true error red is reserved for destructive confirmations only."

colors:
  primary: "#3F6B52"
  primary-deep: "#32553F"
  primary-soft: "#E4EDE6"
  on-primary: "#FFFFFF"
  ink: "#1C1A17"
  body: "#57524B"
  mute: "#767066"
  faint: "#B0A99E"
  on-ink: "#FAF8F5"
  hairline: "#ECE7E0"
  hairline-strong: "#DFD8CE"
  canvas: "#FAF8F5"
  canvas-elevated: "#FFFFFF"
  canvas-sunken: "#F2EEE8"
  canvas-scrim: "rgba(28,26,23,0.45)"
  caution: "#C08A3E"
  caution-deep: "#8A5F22"
  caution-soft: "#F7ECD9"
  positive: "#3F6B52"
  positive-soft: "#E4EDE6"
  error: "#A33A2B"
  error-deep: "#822E22"
  error-soft: "#F6E4E0"
  macro-protein: "#3F6B52"
  macro-carbs: "#C08A3E"
  macro-fat: "#7A6A94"
  photo-scrim: "rgba(28,26,23,0.55)"
  camera-guide: "rgba(250,248,245,0.55)"

typography:
  metric-hero:
    fontFamily: PlusJakartaSans_700Bold
    fontSize: 56px
    fontWeight: 700
    lineHeight: 60px
    letterSpacing: -2px
  metric-lg:
    fontFamily: PlusJakartaSans_700Bold
    fontSize: 32px
    fontWeight: 700
    lineHeight: 38px
    letterSpacing: -1px
  metric-md:
    fontFamily: PlusJakartaSans_600SemiBold
    fontSize: 22px
    fontWeight: 600
    lineHeight: 28px
    letterSpacing: -0.5px
  heading-lg:
    fontFamily: PlusJakartaSans_700Bold
    fontSize: 26px
    fontWeight: 700
    lineHeight: 32px
    letterSpacing: -0.6px
  heading-md:
    fontFamily: PlusJakartaSans_600SemiBold
    fontSize: 19px
    fontWeight: 600
    lineHeight: 26px
    letterSpacing: -0.3px
  heading-sm:
    fontFamily: PlusJakartaSans_600SemiBold
    fontSize: 16px
    fontWeight: 600
    lineHeight: 22px
    letterSpacing: -0.2px
  body-lg:
    fontFamily: PlusJakartaSans_400Regular
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0
  body-md:
    fontFamily: PlusJakartaSans_400Regular
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0
  body-sm:
    fontFamily: PlusJakartaSans_400Regular
    fontSize: 13px
    fontWeight: 400
    lineHeight: 18px
    letterSpacing: 0
  label-md:
    fontFamily: PlusJakartaSans_600SemiBold
    fontSize: 14px
    fontWeight: 600
    lineHeight: 18px
    letterSpacing: -0.1px
  label-sm:
    fontFamily: PlusJakartaSans_600SemiBold
    fontSize: 12px
    fontWeight: 600
    lineHeight: 16px
    letterSpacing: 0.2px
  overline:
    fontFamily: PlusJakartaSans_600SemiBold
    fontSize: 11px
    fontWeight: 600
    lineHeight: 14px
    letterSpacing: 0.8px
    textTransform: uppercase
  button-lg:
    fontFamily: PlusJakartaSans_600SemiBold
    fontSize: 16px
    fontWeight: 600
    lineHeight: 20px
    letterSpacing: -0.1px
  button-md:
    fontFamily: PlusJakartaSans_600SemiBold
    fontSize: 14px
    fontWeight: 600
    lineHeight: 18px
    letterSpacing: -0.1px

rounded:
  none: 0px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 20px
  xl: 28px
  pill: 999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 40px
  3xl: 56px

elevation:
  flat: "1px solid {colors.hairline}"
  whisper: "0px 1px 2px rgba(28,26,23,0.04)"
  raised: "0px 2px 8px rgba(28,26,23,0.06), 0px 1px 2px rgba(28,26,23,0.04)"
  floating: "0px 8px 24px rgba(28,26,23,0.10), 0px 2px 6px rgba(28,26,23,0.06)"

components:
  tab-bar:
    backgroundColor: "{colors.canvas-elevated}"
    borderColor: "{colors.hairline}"
    height: 56px
    padding: "0px {spacing.xs}"
  tab-item:
    textColor: "{colors.mute}"
    textColorActive: "{colors.ink}"
    typography: "{typography.label-sm}"
    iconSize: 24px
    minHeight: 48px
    gap: "{spacing.xxs}"
  tab-fab:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    size: 56px
    rounded: "{rounded.full}"
    elevation: "{elevation.floating}"
    offsetY: -18px
  screen-header:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.heading-md}"
    minHeight: 52px
    padding: "{spacing.xs} {spacing.md}"
  sheet:
    backgroundColor: "{colors.canvas-elevated}"
    rounded: "{rounded.xl} {rounded.xl} {rounded.none} {rounded.none}"
    padding: "{spacing.md} {spacing.md} {spacing.lg}"
    elevation: "{elevation.floating}"
    scrim: "{colors.canvas-scrim}"
  sheet-handle:
    backgroundColor: "{colors.hairline-strong}"
    width: 36px
    height: 4px
    rounded: "{rounded.pill}"
    margin: "{spacing.xs} auto {spacing.md}"
  progress-indicator:
    backgroundColor: "{colors.hairline}"
    fillColor: "{colors.ink}"
    height: 3px
    rounded: "{rounded.pill}"
  card:
    backgroundColor: "{colors.canvas-elevated}"
    borderColor: "{colors.hairline}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
    elevation: "{elevation.whisper}"
  teaser-card:
    backgroundColor: "{colors.canvas-elevated}"
    borderColor: "{colors.hairline}"
    textColor: "{colors.ink}"
    typography: "{typography.heading-sm}"
    rounded: "{rounded.lg}"
    padding: "{spacing.sm}"
    minHeight: 96px
    elevation: "{elevation.whisper}"
  stat-card:
    backgroundColor: "{colors.canvas-elevated}"
    borderColor: "{colors.hairline}"
    textColor: "{colors.ink}"
    typography: "{typography.metric-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
    gap: "{spacing.xxs}"
  list-row:
    backgroundColor: "{colors.canvas-elevated}"
    borderColor: "{colors.hairline}"
    textColor: "{colors.ink}"
    typography: "{typography.heading-sm}"
    minHeight: 56px
    padding: "{spacing.sm} {spacing.md}"
    gap: "{spacing.sm}"
  empty-state:
    backgroundColor: "{colors.canvas-elevated}"
    borderColor: "{colors.hairline}"
    textColor: "{colors.body}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
    borderStyle: dashed
  insight-banner:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.md}"
  text-input:
    backgroundColor: "{colors.canvas-elevated}"
    textColor: "{colors.ink}"
    placeholderColor: "{colors.faint}"
    borderColor: "{colors.hairline-strong}"
    borderColorFocus: "{colors.ink}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.sm}"
    minHeight: 48px
    padding: "{spacing.sm} {spacing.md}"
  numeric-hero-input:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    placeholderColor: "{colors.faint}"
    typography: "{typography.metric-hero}"
    borderColor: "{colors.hairline}"
    padding: "{spacing.xs} 0px"
    textAlign: center
  unit-toggle:
    backgroundColor: "{colors.canvas-sunken}"
    textColor: "{colors.mute}"
    textColorActive: "{colors.ink}"
    thumbColor: "{colors.canvas-elevated}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.pill}"
    height: 32px
    padding: "3px"
  otp-box:
    backgroundColor: "{colors.canvas-elevated}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline-strong}"
    borderColorFocus: "{colors.ink}"
    typography: "{typography.metric-md}"
    rounded: "{rounded.sm}"
    size: 48px
    gap: "{spacing.xs}"
  segmented-control:
    backgroundColor: "{colors.canvas-sunken}"
    textColor: "{colors.mute}"
    textColorActive: "{colors.ink}"
    thumbColor: "{colors.canvas-elevated}"
    typography: "{typography.label-md}"
    rounded: "{rounded.pill}"
    height: 40px
    padding: "3px"
    elevationThumb: "{elevation.whisper}"
  chip:
    backgroundColor: "{colors.canvas-elevated}"
    textColor: "{colors.body}"
    borderColor: "{colors.hairline-strong}"
    typography: "{typography.label-md}"
    rounded: "{rounded.pill}"
    minHeight: 36px
    padding: "0px {spacing.md}"
  chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    borderColor: "{colors.ink}"
    typography: "{typography.label-md}"
    rounded: "{rounded.pill}"
    minHeight: 36px
    padding: "0px {spacing.md}"
  choice-card:
    backgroundColor: "{colors.canvas-elevated}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline-strong}"
    borderColorSelected: "{colors.ink}"
    backgroundColorSelected: "{colors.canvas-elevated}"
    typography: "{typography.heading-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
    minHeight: 76px
    borderWidthSelected: 2px
  stepper:
    backgroundColor: "{colors.canvas-sunken}"
    textColor: "{colors.ink}"
    typography: "{typography.metric-md}"
    rounded: "{rounded.pill}"
    height: 44px
    buttonSize: 38px
  search-bar:
    backgroundColor: "{colors.canvas-sunken}"
    textColor: "{colors.ink}"
    placeholderColor: "{colors.faint}"
    borderColor: transparent
    typography: "{typography.body-lg}"
    rounded: "{rounded.sm}"
    minHeight: 44px
    padding: "0px {spacing.sm}"
  switch:
    trackColorOff: "{colors.hairline-strong}"
    trackColorOn: "{colors.primary}"
    thumbColor: "{colors.canvas-elevated}"
    width: 50px
    height: 30px
  calorie-ring:
    trackColor: "{colors.hairline}"
    fillColor: "{colors.primary}"
    fillColorOver: "{colors.caution}"
    size: 184px
    strokeWidth: 14px
    strokeLinecap: round
    valueTypography: "{typography.metric-hero}"
    captionTypography: "{typography.label-sm}"
    captionColor: "{colors.mute}"
  macro-bar:
    trackColor: "{colors.hairline}"
    height: 6px
    rounded: "{rounded.pill}"
    labelTypography: "{typography.label-sm}"
    labelColor: "{colors.mute}"
    valueTypography: "{typography.metric-md}"
  sparkline:
    strokeColor: "{colors.ink}"
    fillColor: "rgba(28,26,23,0.06)"
    strokeWidth: 2px
    height: 32px
    dotColor: "{colors.ink}"
  trend-chart:
    strokeColor: "{colors.ink}"
    fillColor: "rgba(63,107,82,0.10)"
    gridColor: "{colors.hairline}"
    strokeWidth: 2.5px
    axisTypography: "{typography.body-sm}"
    axisColor: "{colors.mute}"
    rawPointColor: "{colors.faint}"
  pace-badge:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary-deep}"
    backgroundColorCaution: "{colors.caution-soft}"
    textColorCaution: "{colors.caution-deep}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.pill}"
    minHeight: 24px
    padding: "0px {spacing.xs}"
  adherence-cell:
    backgroundColorOnTrack: "{colors.primary}"
    backgroundColorOver: "{colors.caution}"
    backgroundColorUnder: "{colors.primary-soft}"
    backgroundColorEmpty: "{colors.hairline}"
    rounded: "{rounded.xs}"
    size: 32px
  heatmap-cell:
    backgroundColorLogged: "{colors.primary}"
    backgroundColorFrozen: "{colors.primary-soft}"
    backgroundColorEmpty: "{colors.hairline}"
    rounded: "{rounded.xs}"
    size: 30px
    gap: "{spacing.xxs}"
  photo-thumb:
    backgroundColor: "{colors.canvas-sunken}"
    borderColor: "{colors.hairline}"
    rounded: "{rounded.md}"
    aspectRatio: "3/4"
  comparison-frame:
    backgroundColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    captionTypography: "{typography.label-sm}"
    captionColor: "{colors.mute}"
    gap: "{spacing.xs}"
    aspectRatio: "3/4"
  slider-handle:
    backgroundColor: "{colors.canvas-elevated}"
    iconColor: "{colors.ink}"
    lineColor: "{colors.canvas-elevated}"
    size: 44px
    lineWidth: 2px
    rounded: "{rounded.full}"
    elevation: "{elevation.floating}"
  camera-guide-overlay:
    strokeColor: "{colors.camera-guide}"
    strokeWidth: 1.5px
    strokeDasharray: "6 6"
    scrimColor: "{colors.photo-scrim}"
    hintTypography: "{typography.body-sm}"
    hintColor: "{colors.on-ink}"
  scan-frame:
    strokeColor: "{colors.on-ink}"
    strokeWidth: 3px
    cornerLength: 28px
    size: 240px
    rounded: "{rounded.md}"
    scrimColor: "{colors.photo-scrim}"
  detected-item-row:
    backgroundColor: "{colors.canvas-elevated}"
    borderColor: "{colors.hairline}"
    textColor: "{colors.ink}"
    typography: "{typography.heading-sm}"
    secondaryColor: "{colors.mute}"
    minHeight: 56px
    padding: "{spacing.sm}"
    rounded: "{rounded.sm}"
  confidence-badge:
    backgroundColor: "{colors.canvas-sunken}"
    textColor: "{colors.mute}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.pill}"
    padding: "0px {spacing.xs}"
    minHeight: 22px
  preset-tag:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary-deep}"
    typography: "{typography.overline}"
    rounded: "{rounded.xs}"
    padding: "2px {spacing.xxs}"
  streak-flame:
    color: "{colors.caution}"
    colorInactive: "{colors.faint}"
    size: 20px
  milestone-state:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.heading-lg}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    typography: "{typography.button-lg}"
    rounded: "{rounded.pill}"
    minHeight: 52px
    padding: "0px {spacing.lg}"
  button-secondary:
    backgroundColor: "{colors.canvas-elevated}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline-strong}"
    typography: "{typography.button-lg}"
    rounded: "{rounded.pill}"
    minHeight: 52px
    padding: "0px {spacing.lg}"
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.body}"
    typography: "{typography.button-md}"
    rounded: "{rounded.pill}"
    minHeight: 44px
    padding: "0px {spacing.sm}"
  button-icon-circular:
    backgroundColor: "{colors.canvas-elevated}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    size: 44px
    rounded: "{rounded.full}"
  button-destructive-text:
    backgroundColor: transparent
    textColor: "{colors.error}"
    typography: "{typography.button-md}"
    minHeight: 44px
    padding: "0px {spacing.sm}"
  inline-confirm-check:
    backgroundColor: "{colors.primary}"
    iconColor: "{colors.on-primary}"
    size: 28px
    rounded: "{rounded.full}"
  loading-shimmer:
    backgroundColor: "{colors.canvas-sunken}"
    highlightColor: "{colors.hairline}"
    rounded: "{rounded.sm}"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.pill}"
    padding: "{spacing.sm} {spacing.md}"
    elevation: "{elevation.floating}"

motion:
  instant: 120ms
  quick: 180ms
  standard: 260ms
  expressive: 420ms
  ring-fill: 900ms
  easing-standard: "cubic-bezier(0.22, 0.61, 0.36, 1)"
  easing-decelerate: "cubic-bezier(0.16, 1, 0.3, 1)"
  spring-press: "damping 18, stiffness 320"
  spring-drag: "damping 26, stiffness 180"

---

## Overview

This is the design system for the mobile client of a progress-photo and food-logging app. It exists to serve two jobs and nothing else: *am I visibly changing*, and *am I eating on plan*. Every token below is chosen so that answering those two questions takes one glance and one tap.

The system is **near-monochrome on a warm ground**. The canvas is a warm off-white (`{colors.canvas}` — #FAF8F5) and the ink is a warm near-black (`{colors.ink}` — #1C1A17); between them sits a deliberate four-step text ladder. Structure comes from a 1px warm hairline (`{colors.hairline}` — #ECE7E0) *before* any shadow is considered. The single saturated color in everyday use is a calm sage (`{colors.primary}` — #3F6B52), which fills the calorie ring, marks "on pace," and tints the one insight banner on the home screen. That restraint is not an aesthetic preference — it is what makes a progress photo the most colorful thing on screen, which is correct for this product.

**Severity is capped by design.** The strongest signal this app will ever show a user about their own behavior is a warm clay caution (`{colors.caution}` — #C08A3E): "eating over target," "losing faster than planned." There is no red for a missed day, an unlogged meal, or a broken streak. True error red (`{colors.error}`) exists in this file but is reserved exclusively for destructive confirmations the user initiates — deleting an account, deleting a photo. This is the PRD's "no guilt mechanics" principle expressed as a color rule rather than a copy guideline, so it cannot be quietly violated by a well-meaning component.

Typography runs on a single family, **Plus Jakarta Sans** — a humanist sans warm enough to not read as a developer tool, with weights carrying all the hierarchy. There is no second face and no monospace: a spec-sheet mono eyebrow would fight the tone this product needs. The scale is anchored at both ends by things this app actually shows — a 56px hero number (`{typography.metric-hero}`) for the calories remaining, the streak count, and the weight-entry field, down to an 11px uppercase overline (`{typography.overline}`) for section labels.

**Key characteristics:**
- Warm off-white canvas + warm near-black ink, with sage as the only everyday accent.
- Structure is a 1px hairline first, a whisper shadow second, a real shadow only for things that genuinely float (sheets, the center FAB).
- Severity ceiling is clay `{colors.caution}`; red is destructive-confirmation-only.
- One type family, weight-driven hierarchy, tabular figures everywhere a number can change.
- Generous radii (`{rounded.lg}` 20px on cards, `{rounded.xl}` 28px on sheets) — rounded reads calm; tight 6px squares read technical.
- Every interactive target clears 44×44pt, and every screen has exactly one primary action.
- Photos are the only saturated surface in the app. The chrome gets out of their way.

## Colors

### Brand & Accent
- **Sage** (`{colors.primary}` — #3F6B52): the calorie-ring fill, "on pace," selected states that aren't ink, and the insight banner tint. 6.1:1 against white — safe for text and for `{colors.on-primary}` white text on it. Pressed tone `{colors.primary-deep}` (#32553F); wash `{colors.primary-soft}` (#E4EDE6).
- **Ink** (`{colors.ink}` — #1C1A17): not a neutral grey — a warm near-black. Carries headings, primary buttons, selected chips, and the trend-chart stroke. Never use `#000000`.

Note that the **primary button is ink, not sage**. Sage is reserved for *status* (how you're doing); ink is *action* (what you can do). Keeping those two jobs on different colors is what stops the interface from looking like it's congratulating you every time it shows a button.

### Surface
- **Canvas** (`{colors.canvas}` — #FAF8F5): the warm ground every screen sits on.
- **Elevated** (`{colors.canvas-elevated}` — #FFFFFF): cards, sheets, inputs, list rows.
- **Sunken** (`{colors.canvas-sunken}` — #F2EEE8): inset wells — search bars, segmented-control tracks, stepper backgrounds, shimmer base.
- **Scrim** (`{colors.canvas-scrim}`): behind modal sheets.

### Text ladder
Step down deliberately; do not invent intermediate greys.

| Token | Value | Contrast on canvas | Use |
|---|---|---|---|
| `{colors.ink}` | #1C1A17 | 16.4:1 | Headings, metrics, primary content |
| `{colors.body}` | #57524B | 7.3:1 | Paragraphs, secondary copy |
| `{colors.mute}` | #767066 | 4.6:1 | Captions, metadata, inactive tab labels, units |
| `{colors.faint}` | #B0A99E | 2.2:1 | **Placeholders and disabled only** — never load-bearing text |

`{colors.faint}` is deliberately below AA. It is permitted only for placeholder text and disabled controls, both of which are exempt, and must never carry information a user needs.

### Semantic
- **Positive / on-pace** (`{colors.positive}` = `{colors.primary}`): the sage doubles as the positive signal. On-track days, confirmed items, completed steps.
- **Caution** (`{colors.caution}` — #C08A3E): over target, losing/gaining faster than planned. **As a fill only** — at 3.0:1 on white it fails AA for text, so text on a caution surface uses `{colors.caution-deep}` (#8A5F22, 5.6:1) on `{colors.caution-soft}` (#F7ECD9).
- **Error** (`{colors.error}` — #A33A2B): a warm brick, not a siren red. **Destructive confirmations only.** If you are reaching for this to indicate that a user has not logged something, stop — that is the exact pattern this product exists in opposition to.

### Macro colors
`{colors.macro-protein}` (sage), `{colors.macro-carbs}` (clay), `{colors.macro-fat}` (muted plum #7A6A94). Three hues, matched in value so no single macro shouts, used **only** on the macro bars and their labels. They are a legend, not a palette — do not extend them to other surfaces.

### Dark theme
Not in v1. Tokens are structured as semantic roles (`canvas` / `canvas-elevated` / `ink`, not `white` / `grey-900`) specifically so a dark pass is a token-value swap rather than a component rewrite. When it happens, `{colors.photo-scrim}` and `{colors.camera-guide}` are the two that need real thought rather than inversion.

## Typography

### Family
**Plus Jakarta Sans** throughout, via `@expo-google-fonts/plus-jakarta-sans`. Load `400Regular`, `600SemiBold`, `700Bold` — three weights, no more. There is no mono face and no italic.

Family names in `typography` tokens are the literal React Native family strings the loaded font exposes (`PlusJakartaSans_600SemiBold`), so token values can be passed straight to `fontFamily` with no mapping layer.

### Tabular figures — required
Every number that can change in place must not jump: the calorie ring, macro values, weight entry, streak count, chart axes, stepper values, OTP boxes. Apply `fontVariant: ['tabular-nums']` on those `Text` nodes. React Native honours this on both platforms for fonts exposing the `tnum` feature; where it does not take effect, give the numeral a fixed-width container rather than letting it reflow. Never let a counting animation resize its own layout.

### Scale

| Token | Size / Weight | Use |
|---|---|---|
| `{typography.metric-hero}` | 56 / 700 | Calories remaining in the ring, weight-entry input, streak count |
| `{typography.metric-lg}` | 32 / 700 | Comparison stat callouts, share-card stats |
| `{typography.metric-md}` | 22 / 600 | Macro card values, stepper value, OTP digits |
| `{typography.heading-lg}` | 26 / 700 | Screen and onboarding headlines |
| `{typography.heading-md}` | 19 / 600 | Card titles, sheet titles, nav titles |
| `{typography.heading-sm}` | 16 / 600 | List-row titles, detected-item names |
| `{typography.body-lg}` | 16 / 400 | Lead copy, input text |
| `{typography.body-md}` | 14 / 400 | Default body |
| `{typography.body-sm}` | 13 / 400 | Captions, photo dates, chart axes |
| `{typography.label-md}` | 14 / 600 | Chips, segmented control, strong labels |
| `{typography.label-sm}` | 12 / 600 | Tab labels, badges, macro labels, ring caption |
| `{typography.overline}` | 11 / 600, +0.8, uppercase | Section labels, preset tag |
| `{typography.button-lg}` / `{typography.button-md}` | 16 / 600, 14 / 600 | Button labels |

### Principles
- Weight is ternary: 700 for metrics and headlines, 600 for labels/buttons/sub-headings, 400 for prose. Nothing else.
- Negative tracking scales with size (-2px at 56, -0.2px at 16, 0 at body). Only `{typography.overline}` goes positive, because uppercase at 11px needs the air.
- Respect OS font scaling. Cap `allowFontScaling` growth on `{typography.metric-hero}` only (it is already the largest thing on screen and will break the ring layout); everything else scales freely.
- A number and its unit are not the same tier: "1,840" in `{typography.metric-hero}` ink, "kcal left" in `{typography.label-sm}` mute. This pairing is what makes the home screen readable in under three seconds.

## Layout

### Spacing
Base unit 4px: `{spacing.xxs}` 4 · `{spacing.xs}` 8 · `{spacing.sm}` 12 · `{spacing.md}` 16 · `{spacing.lg}` 24 · `{spacing.xl}` 32 · `{spacing.2xl}` 40 · `{spacing.3xl}` 56.

- **Screen gutter** is `{spacing.md}` (16px), always, on every screen.
- **Card interiors** `{spacing.md}`; large feature cards and sheets `{spacing.lg}`.
- **Between sections** on a scrolling screen: `{spacing.lg}`. Between cards in a group: `{spacing.sm}`.
- **Above the tab bar**: reserve `{spacing.3xl}` of bottom scroll padding so the last row is never trapped under the FAB.

### Structure
Single-column, vertically scrolling. Horizontal scroll is used in exactly two places — the "usuals" row and the share-template carousel — and both must show a partial third item at the right edge so the affordance is visible without a hint label.

Safe areas are non-negotiable: the tab bar sits above the bottom inset, the camera overlays respect the top inset, and sheets extend their background into the bottom inset while keeping content above it.

### Touch targets
Minimum 44×44pt for anything tappable. Where a visual element is smaller than that (`{components.streak-flame}`, chart points, the `{components.inline-confirm-check}`), expand the hit area with padding or `hitSlop` rather than growing the visual.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 — Flat | 1px `{colors.hairline}` | Dividers, list rows, inset wells |
| 1 — Whisper | Hairline + `{elevation.whisper}` | Cards, teaser cards — the default |
| 2 — Raised | `{elevation.raised}` | Segmented-control thumb, pressed cards, toasts |
| 3 — Floating | `{elevation.floating}` | Bottom sheets, the center FAB, the comparison slider handle |

Depth is minimal on purpose. A hairline plus the white-on-warm-white surface step does almost all the separating work. In React Native these map to `shadowColor`/`shadowOffset`/`shadowOpacity`/`shadowRadius` on iOS and `elevation` on Android — set both, and tint `shadowColor` to `#1C1A17` rather than black so shadows stay warm.

There is **no decorative system** — no gradients, no glows, no illustration language. The progress photos are the visual interest. Anything else competing with them is a bug.

## Shapes

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 8px | Heatmap and adherence cells, preset tag, small badges |
| `{rounded.sm}` | 12px | Inputs, search bar, OTP boxes, detected-item rows |
| `{rounded.md}` | 16px | Stat cards, photo thumbnails, scan frame |
| `{rounded.lg}` | 20px | Cards, teaser cards, choice cards, comparison frames |
| `{rounded.xl}` | 28px | Bottom sheets (top corners only), milestone state |
| `{rounded.pill}` | 999px | Buttons, chips, segmented controls, toggles, badges |
| `{rounded.full}` | 9999px | Avatars, FAB, circular icon buttons, slider handle |

The radius language is **uniformly generous** — unlike a developer-tool system, there is no tight-square mode. Every button and chip is a pill; every container is 12–28px. This is the single biggest visual lever making the app read as calm rather than technical.

## Components

> Each spec covers Default and, where it matters, pressed/selected/disabled. Variants are separate `components:` entries.

### Navigation

**`tab-bar`** — four destinations (Today / Progress / Plan / You) on a white bar with a top hairline, 56px tall above the safe-area inset.

**`tab-item`** — 24px icon over a `{typography.label-sm}` label. Inactive `{colors.mute}`, active `{colors.ink}`. Active state is weight and color only — no pill, no underline, no background.

**`tab-fab`** — the raised center "+". 56px sage circle, `{elevation.floating}`, offset 18px above the bar. **This is not a fifth tab** — it opens the capture sheet stack and never renders a route of its own. It is the only sage-filled control in the app, which is what makes it findable without a label.

**`screen-header`** — `{typography.heading-md}` title, optional `{components.button-icon-circular}` at each end. Transparent over `{colors.canvas}`; gains a bottom hairline only once content scrolls under it.

**`sheet`** / **`sheet-handle`** — bottom sheets with `{rounded.xl}` top corners over a `{colors.canvas-scrim}`. Always draggable-to-dismiss, always with a visible handle. Used for food detection results, barcode results, angle picking, and quick actions.

**`progress-indicator`** — a 3px ink-filled track for onboarding. Slim by design: it should answer "how much longer" peripherally without becoming a scoreboard.

### Surfaces

**`card`** — the workhorse. White, 1px hairline, `{rounded.lg}`, `{spacing.md}` padding, whisper shadow.

**`teaser-card`** — the home-screen entry points to Progress / Weight / Streak. Each carries a thumbnail or mini-visualization, a `{typography.heading-sm}` line, and one supporting `{typography.body-sm}` mute stat. **Each must define its empty state**, and each empty state must be inviting rather than corrective — "Take your first progress photo," never "You haven't taken any photos."

**`stat-card`** — the three macro cards. Label in `{typography.label-sm}` mute, value in `{typography.metric-md}` ink, `{components.macro-bar}` beneath.

**`list-row`** — meal rows, settings rows, search results. 56px minimum, hairline separator between rows rather than around each.

**`empty-state`** — dashed hairline border distinguishes "nothing here yet" from "something failed." Body copy in `{colors.body}`, one primary action. Never illustrated with a sad or empty metaphor.

**`insight-banner`** — one sage-tinted calm sentence on the home screen, driven by the day's real numbers. Rules: never red, never an exclamation mark, never a countdown, never imperative-with-urgency. "You're about 30g of protein from target, with dinner still to log" is the register. At most one on screen.

### Inputs

**`text-input`** — 48px minimum, hairline-strong border that goes ink on focus. No filled variant.

**`numeric-hero-input`** — the weight-entry field. Borderless, centered, `{typography.metric-hero}`, with the unit as a mute suffix. The screen around it is deliberately almost empty: this is a two-tap interaction and nothing may compete with it.

**`unit-toggle`** — a small kg/lb · cm/ft pill toggle. Sits adjacent to the value it governs, never in a settings screen far from the input.

**`otp-box`** — six 48px boxes, `{spacing.xs}` apart, ink border on the active box.

**`segmented-control`** — sunken track with a white sliding thumb carrying `{elevation.raised}`. Used for Photo/Barcode/Search and for Week/Month/All. The thumb animates; it does not jump.

**`chip`** / **`chip-selected`** — unselected is white with a hairline-strong border and body text; selected inverts to ink fill with `{colors.on-ink}` text. Used for onboarding multi-select, search filters, and export formats.

**`choice-card`** — the Cut / Bulk / Maintain cards. Large, tappable, `{rounded.lg}`; selection is a 2px ink border, **not** a fill and not a checkmark. One question per screen means selection should advance immediately.

**`stepper`** — servings adjustment. 44px track, two 38px round buttons flanking a `{typography.metric-md}` tabular value.

**`search-bar`** — sunken well with a leading magnifier and a trailing clear button once non-empty.

**`switch`** — settings and privacy toggles. Sage when on.

### Data display

**`calorie-ring`** — the hero. 184px, 14px round-capped stroke, hairline track, sage fill sweeping clockwise from 12 o'clock. Center holds the remaining calories in `{typography.metric-hero}` with a `{typography.label-sm}` mute "kcal left" beneath.

Over target, the fill switches to `{colors.caution}` and continues past full into a second lap — it does **not** turn red, does not flash, and does not annotate itself with a warning. Going over is information, not a verdict.

**`macro-bar`** — 6px pill track under each macro value, filled in that macro's color. Over-target fills the full bar and stops; it does not overflow visually.

**`sparkline`** — 32px ink line with a faint fill, in the weight teaser card. No axes, no labels — it is a shape, not a chart.

**`trend-chart`** — the real weight chart. Plot the **rolling average** as the primary 2.5px ink stroke with a sage-tinted area beneath; show raw daily points as small `{colors.faint}` dots behind it. This is a product requirement rendered as a component rule: raw weight is noisy and showing it as the primary line makes normal water-weight fluctuation look like failure.

**`pace-badge`** — "On pace" in sage-soft, "Faster than planned" / "Slower than planned" in caution-soft with `{colors.caution-deep}` text. Three states, never more. The copy describes the rate, never the person.

**`adherence-cell`** / **`heatmap-cell`** — small rounded squares for the analytics strip and streak calendar. A day with no data is `{colors.hairline}` — the same neutral as any other structural line, deliberately not a marked absence. A frozen day is `{colors.primary-soft}`, visibly distinct from both logged and empty without reading as a penalty.

### Feature-specific

**`photo-thumb`** — 3:4, `{rounded.md}`, hairline border, sunken placeholder while loading.

**`comparison-frame`** — the container for a progress photo in a comparison. Ink background (photos rarely fill 3:4 exactly, and ink letterboxing looks intentional where white looks broken). Date and weight caption sit *below* the frame in `{typography.label-sm}` mute, never overlaid on the body.

**`slider-handle`** — the draggable divider on the overlay comparison. A 44px white circle with a 2px white full-height line running through it. This is the most-polished interaction in the app; see Motion.

**`camera-guide-overlay`** — a dashed translucent body-outline guide for progress-photo capture, plus a single `{typography.body-sm}` hint line. Subtle enough to ignore; the guide assists alignment, it does not grade the pose.

**`scan-frame`** — four bright corner brackets over a scrim for barcode mode, 240px square.

**`detected-item-row`** — a row in the AI-detection sheet: item name `{typography.heading-sm}`, portion `{typography.body-sm}` mute, a `{components.confidence-badge}`, and a trailing status icon toggling between confirmed and "tap to adjust."

**`confidence-badge`** — neutral sunken pill showing a percentage. **Deliberately unstyled by value** — no green-at-90%, no amber-at-60%. The TRD is explicit that photo-AI is assist, not authority; coloring confidence would dress a guess up as a verdict.

**`preset-tag`** — a small sage "PRESET" overline tag on preset dishes in search. The row's primary label is the real portion unit ("1 katori"); grams are secondary in mute.

**`streak-flame`** — 20px clay flame, `{colors.faint}` when the streak is zero. Informational, never animated on the home screen.

**`milestone-state`** — the 7-day-milestone moment. Sage-soft panel, `{typography.heading-lg}`. Celebratory, brief, dismissible, and never blocking.

### Buttons

**`button-primary`** — ink pill, 52px, full-width in sheets and on onboarding steps. **One per screen.**

**`button-secondary`** — white pill with a hairline-strong border. Pairs with primary ("Edit items" beside "Add to Lunch").

**`button-ghost`** — text-only, body color. Dismissals and tertiary actions. The paywall's dismiss is this — plain, obvious, and never guilt-worded.

**`button-icon-circular`** — 44px white circle with a hairline. Header actions, carousel controls.

**`button-destructive-text`** — the only component that uses `{colors.error}`. Delete account, delete photo. Text-only, never a filled red button.

### Feedback

**`inline-confirm-check`** — a 28px sage circle with a check. Replaces the quick-add button on a search row after tapping, so a user can log several items without leaving the screen.

**`loading-shimmer`** — sunken base with a hairline highlight sweep. Used for the mock AI-detection delay and any list load.

**`toast`** — ink pill floating above the tab bar. Brief, non-blocking, never used for errors the user must act on.

## Motion

Motion is calm by default and expressive only at genuine milestones. Everyday logging must feel *fast*, which usually means shorter, not more elaborate.

| Moment | Spec |
|---|---|
| Calorie ring fill | `{motion.ring-fill}` (900ms) with `{motion.easing-decelerate}` on mount; `{motion.standard}` on update. Eased, never a snap. The center number counts up in sync. |
| List rows entering | Staggered fade + 8px slide-up, `{motion.quick}` each, ~35ms apart, capped at the first ~8 rows |
| Center FAB press | Scale to 0.92 on `{motion.spring-press}`, release back to 1 |
| Log confirmation | Quick-add button morphs to `{components.inline-confirm-check}` over `{motion.instant}` — a checkmark swap, not a full-screen animation |
| Segmented thumb | `{motion.quick}`, `{motion.easing-standard}` |
| Sheet present/dismiss | `{motion.standard}` `{motion.easing-decelerate}`; drag-to-dismiss follows the finger 1:1 |
| Streak milestone | `{motion.expressive}` (420ms), a scale-and-settle on the milestone panel. More expressive than anything else in the app — and still no confetti burst, no sound, no blocking overlay |
| Screen transitions | Expo Router defaults only. No custom page-transition gimmicks. |

**The comparison slider gets the most care of any interaction in the app.** Gesture Handler driving a Reanimated shared value, entirely on the UI thread — never a JS-thread `setState` per frame. Track the finger 1:1 while dragging, and on release carry momentum with `withDecay` clamped to the frame bounds, settling on `{motion.spring-drag}`. It must feel weighted and continuous, never stepped or snapped to increments. Drag must work anywhere on the photo, not only on the handle.

**Reduced motion:** honour the OS setting. Replace the ring sweep and row stagger with a plain fade, and drop the milestone scale entirely. The slider stays fully interactive — it is direct manipulation, not decoration.

## Do's and Don'ts

### Do
- Give every screen exactly one obvious primary action.
- Reach for a 1px `{colors.hairline}` before any shadow.
- Keep sage for *status* and ink for *action* — the two must not blur.
- Put a real portion unit first on preset foods ("1 katori"), grams second.
- Define the empty state at the same time as the populated state — a first-time user sees the empty one, and it is not an afterthought.
- Use tabular figures on every number that can change in place.
- Plot the rolling average as the primary weight line; raw points stay faint and behind.
- Let photos be the only saturated thing on screen.

### Don't
- Don't use `{colors.error}` for anything the user merely hasn't done yet. Missed days, unlogged meals, and broken streaks are neutral facts, and `{colors.hairline}` is what a missing day looks like.
- Don't add a countdown, a timer, a decaying meter, or any pressure pattern. The only countdown in the app is the 30s OTP resend, which is a technical constraint, not motivation.
- Don't color the confidence badge by value — that turns an assist into an authority.
- Don't stack more than one insight or banner on a screen.
- Don't introduce a second type family, a mono face, or a gradient. There is no decorative system here on purpose.
- Don't put body copy in pure black, or invent greys between the four ladder steps.
- Don't animate the streak flame on the home screen, or otherwise make an ambient signal demand attention — the PRD's word is "silent."
- Don't add any element that doesn't serve progress-photo tracking or food logging. No body-fat stat, no discipline score, no XP, no public profile, no social feed.

## Notes on this file

This replaces a prior `DESIGN.md` that documented **Vercel's Geist marketing-site language** — an analysis of a web product (`nav-bar`, `footer`, `logo-strip`, `hero-band`, `pricing-card`, `code-block`) that defined no mobile patterns and whose only semantic colors were an alarm red and an amber. It also carried a corrupted line inside its YAML frontmatter. It was not a design system for this app and could not have driven this build.

Two things from it were worth keeping and are preserved above: **hairline-before-shadow** as the structural default, and a **strict, deliberately-stepped text ladder**. Everything else here is new.

Open items, flagged rather than guessed:
- **No product name.** Nothing in this system hardcodes one; the wordmark and share watermark read a single `APP_NAME` constant. Resolving the name (PRD §11) should require no change to this file.
- **Dark theme** is deferred to v1.1; tokens are role-named so it is additive.
- **Iconography**: Feather, via `@expo/vector-icons/Feather` — a single-stroke line set at one weight, already bundled with Expo so it adds no dependency. Icons render at 16/18/22/24/26px; nothing else is used.
