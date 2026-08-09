import { Pressable, Text, View } from "react-native";
import { Plus, type LucideIcon } from "lucide-react-native";

type Props = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
};

/**
 * "Empty states are features" — /plan-design-review Design Principles.
 * Warmth + one clear primary action + context, never a bare
 * "No items found."
 */
export function EmptyState({ icon: Icon, title, subtitle, onPrimaryAction, primaryActionLabel }: Props) {
  return (
    <View className="flex-1 items-center justify-center px-8 pb-24">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-accent-soft">
        <Icon color="#2563eb" size={28} strokeWidth={1.75} />
      </View>
      <Text className="mb-1.5 text-center text-[16px] font-semibold text-ink">{title}</Text>
      <Text className="text-center text-[13px] leading-5 text-muted">{subtitle}</Text>

      {onPrimaryAction ? (
        <Pressable
          onPress={onPrimaryAction}
          accessibilityRole="button"
          accessibilityLabel={primaryActionLabel ?? title}
          className="mt-6 h-14 w-14 items-center justify-center rounded-full bg-accent"
          style={{ shadowColor: "#2563eb", shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } }}
        >
          <Plus color="#ffffff" size={26} />
        </Pressable>
      ) : null}
    </View>
  );
}
