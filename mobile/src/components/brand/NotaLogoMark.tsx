import { Image } from "react-native";

type Props = {
  /** Rendered width/height in px — the mark is always square. */
  size?: number;
  /**
   * "tile" draws the dark rounded-square app-icon tile; "mark" would draw
   * just the N on a transparent background. Both currently render the same
   * source image — see comment below — so this prop is kept only for call-
   * site API compatibility, not because the two variants differ today.
   */
  variant?: "tile" | "mark";
};

/**
 * The Nota "N" mark. Previously a hand-vectorized react-native-svg
 * approximation of the real logo, which is exactly why it drifted from the
 * actual brand artwork (a manually re-drawn path is never pixel-identical
 * to the source) — reported as "app icon shows a self-made SVG that
 * doesn't match" and fixed by going back to the real asset instead of
 * re-tracing it again. Now renders assets/icon.png directly, the same file
 * app.json points at for the OS-level app icon, so this component and the
 * home-screen icon can never drift apart again. `variant="mark"` (a
 * transparent, background-less N) isn't produced by this source image and
 * has no current call site — if that's needed later, export a matching
 * transparent PNG rather than hand-drawing new SVG paths.
 */
export function NotaLogoMark({ size = 48 }: Props) {
  return (
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- RN's static image require, not a runtime import
    <Image source={require("../../../assets/icon.png")} style={{ width: size, height: size, borderRadius: size * 0.17 }} />
  );
}
