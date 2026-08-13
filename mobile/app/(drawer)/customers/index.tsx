import { View } from "react-native";
import { Users } from "lucide-react-native";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * Navigation destination only — the real Klanten list/management screen is
 * explicitly out of scope for the drawer build (see FRONTEND-CHECKLIST.md
 * "Customers" section). Customer data still only exists inside the
 * invoice-create picker sheet's mock list for now.
 */
export default function CustomersPlaceholderScreen() {
  return (
    <View className="flex-1 bg-bg">
      <EmptyState
        icon={Users}
        title="Klanten"
        subtitle="Klantenbeheer komt hier binnenkort. Voeg voorlopig klanten toe vanuit het factuur-formulier."
      />
    </View>
  );
}
