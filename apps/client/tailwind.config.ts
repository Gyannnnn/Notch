import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import { colors, radius, spacing, typography } from "./src/theme/tokens";

const px = <T extends Record<string, number>>(scale: T) =>
  Object.fromEntries(Object.entries(scale).map(([k, v]) => [k, `${v}px`]));

/**
 * Composite utilities. Each one replaces a cluster of classes we would
 * otherwise repeat on every screen — `center` instead of
 * `flex items-center justify-center`, and so on.
 */
const semantics = plugin(({ addUtilities }) => {
  addUtilities({
    ".center": { alignItems: "center", justifyContent: "center" },
    ".row": { flexDirection: "row", alignItems: "center" },
    ".row-between": {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    ".row-end": {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
    },
    ".fill": { flex: "1" },
    ".fill-center": { flex: "1", alignItems: "center", justifyContent: "center" },
    ".absolute-fill": { position: "absolute", top: "0px", right: "0px", bottom: "0px", left: "0px" },

    /** The 16px screen gutter DESIGN.md mandates on every screen. */
    ".gutter": { paddingLeft: `${spacing.md}px`, paddingRight: `${spacing.md}px` },

    /** 44pt minimum touch target. */
    ".tappable": { minWidth: "44px", minHeight: "44px" },

    ".hairline-t": { borderTopWidth: "1px", borderTopColor: colors.hairline },
    ".hairline-b": { borderBottomWidth: "1px", borderBottomColor: colors.hairline },
  });
});

/**
 * One class per DESIGN.md typography token, setting family, size, line height
 * and tracking together. Type is never assembled from separate classes.
 */
const typeScale = plugin(({ addUtilities }) => {
  addUtilities(
    Object.fromEntries(
      Object.entries(typography).map(([name, t]) => [
        `.type-${name}`,
        {
          fontFamily: t.font,
          fontSize: `${t.size}px`,
          lineHeight: `${t.leading}px`,
          letterSpacing: `${t.tracking}px`,
          ...("uppercase" in t && t.uppercase ? { textTransform: "uppercase" as const } : {}),
        },
      ]),
    ),
  );
});

export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors,
      spacing: px(spacing),
      borderRadius: px(radius),
    },
  },
  plugins: [semantics, typeScale],
} satisfies Config;
