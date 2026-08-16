import { FlatList, View } from "react-native";
import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { HeaderButton } from "expo-router/react-navigation";
import { FileText, Plus } from "lucide-react-native";
import { useTheme } from "react-native-paper";
import { useInvoiceStore } from "@/features/invoices/InvoiceStore";
import { InvoiceRow } from "@/features/invoices/InvoiceRow";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * The full Facturen list — moved here from "/" (now the dashboard) so
 * "Facturen" can stay its own drawer destination without also being the
 * post-login landing page. Content unchanged from the original index
 * screen.
 */
export default function InvoiceListScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { invoices, sendReminder } = useInvoiceStore();

  function openInvoice(id: string, status: string) {
    // Drafts drill into the editable create form (item 24); everything
    // else (sent/queued/failed) opens the read-only detail view.
    if (status === "draft") {
      router.push(`/invoice/new?editId=${id}`);
    } else {
      router.push(`/invoice/${id}`);
    }
  }

  return (
    <View className="flex-1 bg-bg">
      <Drawer.Screen
        options={{
          headerRight: () => (
            <HeaderButton onPress={() => router.push("/invoice/new")} accessibilityLabel="Nieuwe factuur">
              <Plus color={theme.colors.primary} size={22} />
            </HeaderButton>
          ),
        }}
      />

      {invoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nog geen facturen"
          subtitle="Maak je eerste factuur in minder dan 30 seconden."
          onPrimaryAction={() => router.push("/invoice/new")}
          primaryActionLabel="Nieuwe factuur"
        />
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 8 }}
          renderItem={({ item }) => (
            <InvoiceRow invoice={item} onPress={() => openInvoice(item.id, item.status)} onSendReminder={sendReminder} />
          )}
        />
      )}
    </View>
  );
}
