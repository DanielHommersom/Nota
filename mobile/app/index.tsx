import { FlatList, Pressable, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { FileText, Plus } from "lucide-react-native";
import { useInvoiceStore } from "@/features/invoices/InvoiceStore";
import { InvoiceRow } from "@/features/invoices/InvoiceRow";
import { EmptyState } from "@/components/ui/EmptyState";

export default function InvoiceListScreen() {
  const router = useRouter();
  const { invoices } = useInvoiceStore();

  return (
    <View className="flex-1 bg-bg">
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/invoice/new")}
              accessibilityRole="button"
              accessibilityLabel="Nieuwe factuur"
              hitSlop={8}
              className="h-11 w-11 items-center justify-center"
            >
              <Plus color="#2563eb" size={24} />
            </Pressable>
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
            <InvoiceRow invoice={item} onPress={() => router.push(`/invoice/${item.id}`)} />
          )}
        />
      )}
    </View>
  );
}
