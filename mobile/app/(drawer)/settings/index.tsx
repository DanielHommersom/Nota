import { View } from "react-native";
import { Settings } from "lucide-react-native";
import { EmptyState } from "@/components/ui/EmptyState";

/** Navigation destination only — explicitly a placeholder for now, per spec. */
export default function SettingsPlaceholderScreen() {
  return (
    <View className="flex-1 bg-bg">
      <EmptyState icon={Settings} title="Instellingen" subtitle="Instellingen komen hier binnenkort." />
    </View>
  );
}
