import { Platform } from "react-native";
import type { BrandingFont } from "./types";

/**
 * A curated palette, not a free-form color wheel — per the project brief's
 * "wij concurreren op ... premium uitstraling", a constrained set of
 * pre-vetted, print-safe colors keeps every generated invoice looking
 * intentional instead of letting someone pick a low-contrast or garish
 * combination.
 */
export const ACCENT_COLOR_PRESETS: { label: string; value: string }[] = [
  { label: "Nota blauw", value: "#2563eb" },
  { label: "Inkt", value: "#1a1a1a" },
  { label: "Bosgroen", value: "#15803d" },
  { label: "Terracotta", value: "#c2410c" },
  { label: "Bordeaux", value: "#9f1239" },
  { label: "Paars", value: "#7c3aed" },
];

/**
 * No custom font files are bundled (that's a real, separate lift — see
 * TODOS.md's DESIGN.md item for the kind of system-wide decision that
 * deserves its own review). Instead this offers two RN-native generic font
 * families that need no extra assets or expo-font loading, so branding
 * still visibly changes the invoice's feel today.
 */
export const FONT_OPTIONS: { label: string; value: BrandingFont; sample: string }[] = [
  { label: "Standaard", value: "standaard", sample: "Aa" },
  { label: "Klassiek", value: "klassiek", sample: "Aa" },
];

export function fontFamilyFor(font: BrandingFont): string | undefined {
  if (font === "klassiek") {
    return Platform.select({ ios: "Georgia", android: "serif", default: "serif" });
  }
  return undefined;
}
