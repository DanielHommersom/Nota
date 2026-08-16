import { Pressable, Text } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { useTheme } from "react-native-paper";

type Props = {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  /** Highlights the current section — e.g. "Facturen" while on the home route. */
  active?: boolean;
  tone?: "default" | "danger";
  accessibilityLabel?: string;
};

/** Drawer row: icon + label, ≥44pt tap target, active-section highlight. */
export function MenuItem({ icon: Icon, label, onPress, active = false, tone = "default", accessibilityLabel }: Props) {
  // Read from the theme, not hardcoded hex — the `active` branch used to be
  // "#2563eb", the pre-rebrand blue, a leftover from before the "use the
  // logo's colors" design-system pass (src/theme/colors.js) that every
  // Paper component already picked up automatically. The other two
  // branches happened to already match theme.colors.error/onSurfaceVariant
  // by coincidence, but are switched too so this component has zero
  // hardcoded color values left to drift out of sync again.
  const theme = useTheme();
  const iconColor = tone === "danger" ? theme.colors.error : active ? theme.colors.primary : theme.colors.onSurfaceVariant;
  const textColorClass = tone === "danger" ? "text-warn" : active ? "text-accent" : "text-ink";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected: active }}
      className={`mb-1 min-h-11 flex-row items-center gap-3 rounded-control px-3 ${active ? "bg-accent-soft" : ""}`}
    >
      <Icon color={iconColor} size={20} strokeWidth={active ? 2.25 : 2} />
      <Text className={`text-[15px] ${active ? "font-semibold" : "font-medium"} ${textColorClass}`}>{label}</Text>
    </Pressable>
  );
}
