/** @type {import('tailwindcss').Config} */
// Colors now come from src/theme/colors.js — the single source of truth
// shared with the React Native Paper theme (src/theme/paperTheme.ts), so
// a NativeWind className like bg-accent and a Paper component reading
// theme.colors.primary always resolve to the same hex. See that file's
// comment for why it's plain JS rather than a .scss file.
const { colors } = require("./src/theme/colors");

module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  // "class" (not the "media" default) is required for NativeWind on web —
  // Expo Router calls Appearance.setColorScheme during web hydration, which
  // NativeWind only permits under "class" mode. The design doc locks a
  // single light theme (app.json userInterfaceStyle: "light"), so this
  // never actually toggles anything — it just stops the crash.
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: colors.bg,
        card: colors.card,
        border: colors.border,
        ink: colors.ink,
        muted: colors.muted,
        accent: colors.accent,
        "accent-soft": colors.accentSoft,
        success: colors.success,
        "success-soft": colors.successSoft,
        warn: colors.warn,
        "warn-soft": colors.warnSoft,
      },
      borderRadius: {
        card: "18px",
        control: "14px",
        pill: "999px",
      },
    },
  },
  plugins: [],
};
