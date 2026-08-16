import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { HeaderButton } from "expo-router/react-navigation";
import { Plus, Search, Users } from "lucide-react-native";
import { List, Text, TextInput, useTheme } from "react-native-paper";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCustomerStore } from "@/features/customers/CustomerStore";

/**
 * Real Klanten screen — was a bare EmptyState placeholder
 * (FRONTEND-CHECKLIST.md §Customers: "no 'Klanten' screen to see, edit, or
 * archive existing customers on its own"). Search box included per the
 * project brief's explicit ask (item 9) even though TODOS.md deferred it
 * as "fine until 10-15 customers" — cheap to add now, and the picker sheet
 * reuses the same filter logic.
 */
export default function CustomersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { customers } = useCustomerStore();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => c.name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q));
  }, [customers, query]);

  return (
    <View className="flex-1 bg-bg">
      <Drawer.Screen
        options={{
          headerRight: () => (
            <HeaderButton onPress={() => router.push("/customer/new")} accessibilityLabel="Nieuwe klant">
              <Plus color={theme.colors.primary} size={22} />
            </HeaderButton>
          ),
        }}
      />

      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nog geen klanten"
          subtitle="Voeg je eerste klant toe, of maak er een aan tijdens het opstellen van een factuur."
          onPrimaryAction={() => router.push("/customer/new")}
          primaryActionLabel="Nieuwe klant"
        />
      ) : (
        <>
          <View className="px-4 pb-2 pt-3">
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Zoek een klant"
              placeholderTextColor="#b8b8bc"
              mode="outlined"
              dense
              // No hardcoded borderColor here on purpose: Paper's Outline
              // draws the border color from outlineColor/activeOutlineColor
              // (default: theme.colors.outline at rest, theme.colors.primary
              // + 2px when focused) and applies outlineStyle *after* that,
              // so a static borderColor in outlineStyle wins every render
              // and permanently masks the focus color change. borderRadius
              // is a plain layout value, not part of that color animation,
              // so it's safe to set here.
              outlineStyle={{ borderRadius: 14 }}
              left={<TextInput.Icon icon={() => <Search color={theme.colors.onSurfaceVariant} size={16} />} />}
              accessibilityLabel="Zoek een klant"
            />
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingTop: 4 }}
            ListEmptyComponent={
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant, textAlign: "center", marginTop: 32 }}
              >
                Geen klanten gevonden voor &ldquo;{query}&rdquo;.
              </Text>
            }
            renderItem={({ item }) => (
              <List.Item
                title={item.name}
                titleStyle={{ fontSize: 15, fontWeight: "500", color: theme.colors.onSurface }}
                description={`${item.isBusiness ? "Zakelijk" : "Particulier"}${item.city ? ` · ${item.city}` : ""}`}
                descriptionStyle={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}
                onPress={() => router.push(`/customer/${item.id}/edit`)}
                accessibilityLabel={`${item.name} bewerken`}
                style={{ paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.outlineVariant }}
              />
            )}
          />
        </>
      )}
    </View>
  );
}
