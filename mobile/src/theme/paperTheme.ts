import { MD3LightTheme, type MD3Theme } from "react-native-paper";
import { colors } from "./colors";

/**
 * The app's single React Native Paper theme — every Paper component
 * (Button, TextInput, Card, Dialog, Banner, Chip, ...) reads its colors
 * from here via PaperProvider (see app/_layout.tsx), instead of each
 * component picking its own. Built on MD3LightTheme so anything Paper
 * derives internally (state layers, disabled opacities, ripple colors)
 * still follows Material 3 rules — only the actual color values change,
 * pulled from colors.js so this file and tailwind.config.js can never
 * drift apart.
 *
 * Mapping notes:
 * - primary = accent (the app's one brand blue, used everywhere a MUI
 *   app would reach for `primary`).
 * - tertiary = success green — the closest thing this palette has to a
 *   Material "third" color, reused for paid/sent/positive states.
 * - error = warn (amber), not a true red: the existing design has never
 *   distinguished "warning" from "destructive" — ConfirmDialog's
 *   `destructive` prop and StatusBanner's `failed` kind both already use
 *   this same amber. Kept as-is rather than inventing a new red the rest
 *   of the app doesn't use.
 * - elevation levels all resolve to the flat white card color: the
 *   existing design uses a hairline border + a very faint shadow for
 *   depth (see components/ui/Card.tsx), not Material's tonal elevation
 *   overlays — so elevated surfaces stay visually consistent with that.
 */
export const paperTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 14, // matches the existing "control" border-radius token
  colors: {
    ...MD3LightTheme.colors,

    primary: colors.accent,
    onPrimary: colors.white,
    primaryContainer: colors.accentSoft,
    onPrimaryContainer: colors.accent,

    secondary: colors.muted,
    onSecondary: colors.white,
    secondaryContainer: colors.bg,
    onSecondaryContainer: colors.ink,

    tertiary: colors.success,
    onTertiary: colors.white,
    tertiaryContainer: colors.successSoft,
    onTertiaryContainer: colors.success,

    error: colors.warn,
    onError: colors.white,
    errorContainer: colors.warnSoft,
    onErrorContainer: colors.warn,

    background: colors.bg,
    onBackground: colors.ink,
    surface: colors.card,
    onSurface: colors.ink,
    surfaceVariant: colors.bg,
    onSurfaceVariant: colors.muted,

    outline: colors.border,
    outlineVariant: colors.border,

    elevation: {
      level0: "transparent",
      level1: colors.card,
      level2: colors.card,
      level3: colors.card,
      level4: colors.card,
      level5: colors.card,
    },

    surfaceDisabled: "rgba(26, 26, 26, 0.12)",
    onSurfaceDisabled: colors.muted,
    backdrop: "rgba(26, 26, 26, 0.4)", // matches ConfirmDialog's old bg-black/40
  },
};

export type AppTheme = typeof paperTheme;
