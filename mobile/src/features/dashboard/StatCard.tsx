import { Pressable, Text, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { useTheme } from "react-native-paper";
import { Card } from "@/components/ui/Card";

type Row = { label: string; value: string; valueClassName?: string };

type Props = {
  icon: LucideIcon;
  iconColor?: string;
  iconBgClassName?: string;
  label: string;
  primaryValue: string;
  rows?: Row[];
  onPress?: () => void;
  accessibilityLabel: string;
};

/**
 * One tile on the dashboard: icon + label header, a big headline number,
 * then a couple of supporting stat rows. Tappable when `onPress` is
 * given (Facturen/Inkomend drill into their list); the Bank card has
 * nowhere to go yet, so it renders as a plain, non-pressable View.
 */
export function StatCard({
  icon: Icon,
  // No hardcoded hex default here — this used to be "#2563eb", the
  // pre-rebrand blue accent that never got swept up in the "use the
  // logo's colors" design-system pass (src/theme/colors.js), since it
  // lived as a raw string default instead of a theme lookup. Falling
  // through to theme.colors.primary keeps this card's icon on-brand (the
  // logo teal) for every caller that doesn't explicitly override it, the
  // same way the "Inkomend" card already explicitly opts into amber below.
  iconColor,
  iconBgClassName = "bg-accent-soft",
  label,
  primaryValue,
  rows = [],
  onPress,
  accessibilityLabel,
}: Props) {
  const theme = useTheme();
  const resolvedIconColor = iconColor ?? theme.colors.primary;
  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      {...(onPress ? { onPress, accessibilityRole: "button" as const, accessibilityLabel } : {})}
      className={onPress ? "active:opacity-70" : ""}
    >
      <Card className="p-4">
        <View className="flex-row items-center gap-2.5">
          <View className={`h-9 w-9 items-center justify-center rounded-full ${iconBgClassName}`}>
            <Icon color={resolvedIconColor} size={18} />
          </View>
          <Text className="text-[13px] font-semibold uppercase tracking-wide text-muted">{label}</Text>
        </View>

        <Text className="mt-3 text-[26px] font-bold tracking-tight text-ink">{primaryValue}</Text>

        {rows.length > 0 ? (
          <View className="mt-3 gap-1.5 border-t border-border pt-3">
            {rows.map((row) => (
              <View key={row.label} className="flex-row items-center justify-between">
                <Text className="text-[13px] text-muted">{row.label}</Text>
                <Text className={`text-[13px] font-medium ${row.valueClassName ?? "text-ink"}`}>{row.value}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Card>
    </Wrapper>
  );
}
