import { Pressable, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { Text, useTheme } from "react-native-paper";
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
 * given (Facturen/Inkomend drill into their list); omit it for a stat
 * with nowhere to go, and it renders as a plain, non-pressable View. Built
 * on the Paper-backed <Card> (see components/ui/Card.tsx) with Paper's
 * <Text variant="..."> for typography, rather than a dedicated Paper
 * component — Paper has no "icon header + headline + stat rows" tile, and
 * composing one from Text/View is the same thing Paper's own examples do
 * for custom card content.
 */
export function StatCard({
  icon: Icon,
  iconColor = "#2563eb",
  iconBgClassName = "bg-accent-soft",
  label,
  primaryValue,
  rows = [],
  onPress,
  accessibilityLabel,
}: Props) {
  const theme = useTheme();
  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      {...(onPress ? { onPress, accessibilityRole: "button" as const, accessibilityLabel } : {})}
      className={onPress ? "active:opacity-70" : ""}
    >
      <Card className="p-4">
        <View className="flex-row items-center gap-2.5">
          <View className={`h-9 w-9 items-center justify-center rounded-full ${iconBgClassName}`}>
            <Icon color={iconColor} size={18} />
          </View>
          <Text
            variant="labelMedium"
            style={{ color: theme.colors.onSurfaceVariant, textTransform: "uppercase", letterSpacing: 0.4 }}
          >
            {label}
          </Text>
        </View>

        <Text variant="headlineSmall" style={{ marginTop: 12, color: theme.colors.onSurface, fontWeight: "700" }}>
          {primaryValue}
        </Text>

        {rows.length > 0 ? (
          <View className="mt-3 gap-1.5 border-t border-border pt-3">
            {rows.map((row) => (
              <View key={row.label} className="flex-row items-center justify-between">
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {row.label}
                </Text>
                <Text
                  variant="bodySmall"
                  style={{ fontWeight: "500", color: theme.colors.onSurface }}
                  className={row.valueClassName}
                >
                  {row.value}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </Card>
    </Wrapper>
  );
}
