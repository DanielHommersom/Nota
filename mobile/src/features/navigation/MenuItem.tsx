import { Pressable, Text } from "react-native";
import type { LucideIcon } from "lucide-react-native";

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
  const iconColor = tone === "danger" ? "#b45309" : active ? "#2563eb" : "#6b6b70";
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
