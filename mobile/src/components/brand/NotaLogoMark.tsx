import Svg, { Path, Rect } from "react-native-svg";

type Props = {
  /** Rendered width/height in px — the mark is always square. */
  size?: number;
  /** "tile" draws the dark rounded-square app-icon tile; "mark" draws just the N, transparent, for placing on any background. */
  variant?: "tile" | "mark";
};

const CREAM = "#F8F5EF";
const ACCENT = "#55CDA3";
const TILE_BG = "#12302E";

/**
 * The Nota "N" mark, vectorized from the app icon artwork — kept in sync
 * with assets/icon.png / splash-icon.png / android-icon-*.png (see
 * scripts/generate-brand-assets or the design source if one exists).
 * Rendered as react-native-svg rather than an <Image> so it stays crisp
 * at any size (drawer header, auth screen, empty states) without shipping
 * another raster asset per usage.
 */
export function NotaLogoMark({ size = 48, variant = "tile" }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      {variant === "tile" ? <Rect x={4} y={4} width={192} height={192} rx={34} fill={TILE_BG} /> : null}
      <Path
        fill={CREAM}
        d="
          M 43.9 50.2
          A 8 8 0 0 1 51.9 42.2
          L 74.5 42.2
          L 124 78
          L 156.8 78
          L 156.8 143.4
          A 10 10 0 0 1 146.8 153.4
          L 117.1 153.4
          L 74.5 90.7
          L 74.5 145.4
          A 8 8 0 0 1 66.5 153.4
          L 51.9 153.4
          A 8 8 0 0 1 43.9 145.4
          Z
        "
      />
      <Path fill={ACCENT} d="M 118 44 L 156.8 78 Q 138 92 118 44 Z" />
      <Rect x={115} y={123.5} width={32} height={4} rx={2} fill={ACCENT} />
      <Rect x={121} y={133.5} width={26} height={4} rx={2} fill={ACCENT} />
    </Svg>
  );
}
