import { Modal, Pressable, Text, View } from "react-native";
import { X } from "lucide-react-native";
import { CustomerForm } from "./CustomerForm";
import type { CustomerFormValues } from "./schema";
import type { Customer } from "./types";

const BLANK_VALUES: CustomerFormValues = {
  name: "",
  email: "",
  isBusiness: false,
  kvkNummer: "",
  btwNummer: "",
  address: "",
  postcode: "",
  city: "",
  notes: "",
};

type Props = {
  visible: boolean;
  onCreate: (customer: Customer) => void;
  onClose: () => void;
};

/**
 * True "on the fly" customer creation (project brief item 7) — a sheet
 * layered directly on top of the invoice form, not a full-screen
 * navigation. An earlier version routed to /customer/new and navigated
 * back with a query param, which under expo-router's modal presentation
 * on web left two invoice/new screens mounted simultaneously (confirmed
 * while testing: duplicate "Kies een klant" / line-item fields in the
 * DOM). Doing it in-place avoids that whole class of stack-duplication
 * bug and is one fewer screen transition besides — better fit for the
 * "30 seconds" promise than a real navigation would be anyway.
 */
export function QuickAddCustomerSheet({ visible, onCreate, onClose }: Props) {
  function save(values: CustomerFormValues) {
    const customer: Customer = {
      id: `cust_${Date.now()}`,
      name: values.name.trim(),
      email: values.email?.trim() || undefined,
      isBusiness: values.isBusiness,
      kvkNummer: values.isBusiness ? values.kvkNummer?.trim() || undefined : undefined,
      btwNummer: values.isBusiness ? values.btwNummer?.trim() || undefined : undefined,
      address: values.address?.trim() || undefined,
      postcode: values.postcode?.trim() || undefined,
      city: values.city?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
    };
    onCreate(customer);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/30" onPress={onClose} accessibilityLabel="Sluiten" />
      <View className="max-h-[92%] rounded-t-[24px] bg-card pt-3">
        <View className="mb-1 flex-row items-center justify-between px-4 pb-2">
          <Text className="text-[16px] font-semibold text-ink">Nieuwe klant</Text>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Sluiten"
            hitSlop={8}
            className="h-9 w-9 items-center justify-center rounded-full bg-bg"
          >
            <X color="#6b6b70" size={18} />
          </Pressable>
        </View>
        <CustomerForm defaultValues={BLANK_VALUES} onSubmit={save} submitLabel="Klant opslaan en selecteren" />
      </View>
    </Modal>
  );
}
