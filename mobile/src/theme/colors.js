/**
 * Single source of truth for Nota's color palette.
 *
 * Plain JS (not .ts): tailwind.config.js is loaded directly by Node, no
 * TypeScript compilation step, so it can require() this with zero extra
 * tooling. src/theme/paperTheme.ts imports the exact same object to build
 * the React Native Paper theme, so Paper's components and any remaining
 * NativeWind utility classes always agree on what "accent" or "warn"
 * means. See colors.d.ts for the type declaration tsc uses when a .ts
 * file imports this.
 *
 * This is the "central colors file" for the design system, in the shape
 * this stack actually supports: Expo/Metro doesn't compile Sass, and
 * neither React Native Paper nor Tailwind/NativeWind read a .scss file —
 * both take a plain JS object instead. Change a value here and it
 * propagates everywhere that used to hardcode it.
 */
const colors = {
  bg: "#f7f7f8",
  card: "#ffffff",
  border: "#e5e5e7",
  ink: "#1a1a1a",
  // #6b6b70 on white ~= 5.9:1 contrast, passes WCAG AA (4.5:1 min) for body text.
  muted: "#6b6b70",
  // Sourced from the actual Nota logo mark (see NotaLogoMark.tsx), not an
  // arbitrary brand blue: `accent` is the mark's dark teal tile background
  // (TILE_BG, #12302E) — 14:1 contrast against white, so it works as a
  // solid button fill with white label text the same way the logo tile
  // pairs its dark background with the cream "N". `accentSoft` is a pale
  // tint of the mark's mint highlight color (ACCENT, #55CDA3) rather than
  // a tint of `accent` itself — blending the near-black teal down to a
  // "soft" background mostly just produces gray, while tinting the mint
  // keeps the soft variant visibly on-brand. The raw mint (#55CDA3) is
  // intentionally not used as a solid fill anywhere text sits on top of it
  // directly: only ~2:1 contrast against white, well under WCAG AA.
  accent: "#12302E",
  accentSoft: "#e6f8f1",
  success: "#16a34a",
  successSoft: "#eafaf0",
  warn: "#b45309",
  warnSoft: "#fef3e2",
  white: "#ffffff",
  black: "#000000",
};

module.exports = { colors };
