import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { IconButton, List, Modal, Portal, Text, TextInput, useTheme } from "react-native-paper";
import { Plus, Search } from "lucide-react-native";
import type { Customer } from "./types";

type Props = {
  visible: boolean;
  customers: Customer[];
  onSelect: (customer: Customer) => void;
  onCreateNew: () => void;
  onClose: () => void;
};

/** Search box added per project brief item 9 ("klant zoeken/selecteren bij nieuwe factuur") — filters the same live customer list the Klanten screen manages. Now Paper's <Modal> (bottom-sheet positioned via `style`) + <List.Item> rows instead of a hand-rolled RN Modal. */
export function CustomerPickerSheet({ visible, customers, onSelect, onCreateNew, onClose }: Props) {
  const theme = useTheme();
  const [query, setQuery] = useState("");

  // Paper's <Modal> has no onShow callback (unlike RN's own Modal, which
  // this used to be built on). Clearing the search on every re-open is
  // "adjusting state when a prop changes" — done during render (React's
  // documented pattern for this) rather than in a useEffect, which would
  // cause an extra render.
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setQuery("");
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => c.name.toLowerCase().includes(q));
  }, [customers, query]);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        style={{ justifyContent: "flex-end", margin: 0 }}
        contentContainerStyle={{
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxHeight: "80%",
          paddingBottom: 32,
          paddingTop: 12,
        }}
      >
        <View className="mb-2 flex-row items-center justify-between px-4">
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
            Kies een klant
          </Text>
          <IconButton icon="close" onPress={onClose} accessibilityLabel="Sluiten" size={18} />
        </View>

        {customers.length > 4 ? (
          <View className="mb-1 px-4 pb-2">
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Zoek een klant"
              placeholderTextColor="#b8b8bc"
              mode="outlined"
              dense
              // No hardcoded borderColor here — see the same field in
              // app/(drawer)/customers/index.tsx: Paper applies outlineStyle
              // after its own focus-color logic, so a static borderColor
              // would permanently override the teal focus border.
              outlineStyle={{ borderRadius: 14 }}
              left={<TextInput.Icon icon={() => <Search color={theme.colors.onSurfaceVariant} size={16} />} />}
              accessibilityLabel="Zoek een klant"
              autoFocus={false}
            />
          </View>
        ) : null}

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: "center", paddingVertical: 16 }}>
              Geen klanten gevonden.
            </Text>
          }
          renderItem={({ item }) => (
            <List.Item
              title={item.name}
              titleStyle={{ fontSize: 15, color: theme.colors.onSurface }}
              onPress={() => onSelect(item)}
              accessibilityLabel={item.name}
              style={{ paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.outlineVariant }}
            />
          )}
          ListFooterComponent={
            <List.Item
              title="Nieuwe klant"
              titleStyle={{ fontSize: 15, fontWeight: "500", color: theme.colors.primary }}
              left={() => <Plus color={theme.colors.primary} size={18} style={{ marginLeft: 16, alignSelf: "center" }} />}
              onPress={onCreateNew}
              accessibilityLabel="Nieuwe klant toevoegen"
            />
          }
        />
      </Modal>
    </Portal>
  );
}
