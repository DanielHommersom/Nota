export type BrandingFont = "standaard" | "klassiek";

export type Branding = {
  logoUri: string | null;
  /** Full-bleed background image behind the invoice header — "eigen briefpapier". */
  letterheadUri: string | null;
  font: BrandingFont;
  /** Hex, one of the ACCENT_COLOR_PRESETS in presets.ts. */
  accentColor: string;
};

export const DEFAULT_BRANDING: Branding = {
  logoUri: null,
  letterheadUri: null,
  font: "standaard",
  accentColor: "#2563eb",
};
