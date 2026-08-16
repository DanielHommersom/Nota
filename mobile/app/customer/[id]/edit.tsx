import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Trash2 } from "lucide-react-native";
import { CustomerForm } from "@/features/customers/CustomerForm";
import { useCustomerStore } from "@/features/customers/CustomerStore";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { CustomerFormValues } from "@/features/customers/schema";

/** Klantgegevens bewerken + verwijderen (FRONTEND-CHECKLIST.md §Customers, items 10-11). */
export default function EditCustomerScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCustomer, updateCustomer, deleteCustomer } = useCustomerStore();
  const [deleteVisible, setDeleteVisible] = useState(false);

  const customer = getCustomer(id);

  if (!customer) {
    return (
      <View className="flex-1 items-center justify-center bg-bg px-6">
        <Text className="text-[15px] text-muted">Klant niet gevonden.</Text>
      </View>
    );
  }

  const defaultValues: CustomerFormValues = {
    name: customer.name,
    email: customer.email ?? "",
    isBusiness: customer.isBusiness,
    kvkNummer: customer.kvkNummer ?? "",
    btwNummer: customer.btwNummer ?? "",
    address: customer.address ?? "",
    postcode: customer.postcode ?? "",
    city: customer.city ?? "",
    notes: customer.notes ?? "",
  };

  function save(values: CustomerFormValues) {
    updateCustomer(id, {
      name: values.name.trim(),
      email: values.email?.trim() || undefined,
      isBusiness: values.isBusiness,
      kvkNummer: values.isBusiness ? values.kvkNummer?.trim() || undefined : undefined,
      btwNummer: values.isBusiness ? values.btwNummer?.trim() || undefined : undefined,
      address: values.address?.trim() || undefined,
      postcode: values.postcode?.trim() || undefined,
      city: values.city?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
    });
    router.back();
  }

  function confirmDelete() {
    setDeleteVisible(false);
    deleteCustomer(id);
    router.back();
  }

  return (
    <View className="flex-1 bg-bg">
      <CustomerForm
        defaultValues={defaultValues}
        onSubmit={save}
        submitLabel="Wijzigingen opslaan"
        footer={
          <Pressable
            onPress={() => setDeleteVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Klant verwijderen"
            className="mt-6 min-h-11 flex-row items-center justify-center gap-2"
          >
            <Trash2 color="#b45309" size={16} />
            <Text className="text-[14px] font-medium text-warn">Klant verwijderen</Text>
          </Pressable>
        }
      />

      <ConfirmDialog
        visible={deleteVisible}
        title="Klant verwijderen?"
        message={`${customer.name} wordt verwijderd uit je klantenlijst. Bestaande facturen aan deze klant blijven bewaard.`}
        confirmLabel="Verwijderen"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteVisible(false)}
      />
    </View>
  );
}
