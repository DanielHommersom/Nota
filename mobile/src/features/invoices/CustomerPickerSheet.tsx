import { FlatList, Modal, Pressable, Text, View } from "react-native";
import { Plus, X } from "lucide-react-native";
import type { Customer } from "./types";

type Props = {
  visible: boolean;
  customers: Customer[];
  onSelect: (customer: Customer) => void;
  onCreateNew: () => void;
  onClose: () => void;
};

export function CustomerPickerSheet({ visible, customers, onSelect, onCreateNew, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/30" onPress={onClose} />
      <View className="rounded-t-[24px] bg-card pb-8 pt-3">
        <View className="mb-2 flex-row items-center justify-between px-4">
          <Text className="text-[16px] font-semibold text-ink">Kies een klant</Text>
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

        <FlatList
          data={customers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onSelect(item)}
              accessibilityRole="button"
              accessibilityLabel={item.name}
              className="border-b border-border px-4 py-3.5 active:bg-bg"
            >
              <Text className="text-[15px] text-ink">{item.name}</Text>
            </Pressable>
          )}
          ListFooterComponent={
            <Pressable
              onPress={onCreateNew}
              accessibilityRole="button"
              accessibilityLabel="Nieuwe klant toevoegen"
              className="flex-row items-center gap-2 px-4 py-3.5"
            >
              <Plus color="#2563eb" size={18} />
              <Text className="text-[15px] font-medium text-accent">Nieuwe klant</Text>
            </Pressable>
          }
        />
      </View>
    </Modal>
  );
}
