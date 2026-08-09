import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Card, CardRow } from "@/components/ui/Card";
import { SendButton } from "@/components/ui/SendButton";

/**
 * Front-end baseline stub — creates a customer locally and returns.
 * Not yet wired to Supabase (T1, /plan-eng-review).
 */
export default function NewCustomerScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isBusiness, setIsBusiness] = useState(false);
  const [kvk, setKvk] = useState("");
  const [btw, setBtw] = useState("");

  const canSave = name.trim().length > 0;

  return (
    <KeyboardAvoidingView className="flex-1 bg-bg" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="mb-2 ml-1 text-[12px] font-semibold uppercase tracking-wide text-muted">Klantgegevens</Text>
        <Card>
          <CardRow isLast>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Naam klant"
              placeholderTextColor="#b8b8bc"
              className="flex-1 text-[15px] text-ink"
              accessibilityLabel="Naam van de klant"
            />
          </CardRow>
        </Card>

        <Text className="mb-2 ml-1 mt-5 text-[12px] font-semibold uppercase tracking-wide text-muted">
          Type klant
        </Text>
        <Card>
          <CardRow isLast={!isBusiness}>
            <Text className="text-[15px] text-ink">Zakelijke klant (B2B)</Text>
            <Pressable
              onPress={() => setIsBusiness((v) => !v)}
              accessibilityRole="switch"
              accessibilityState={{ checked: isBusiness }}
              accessibilityLabel="Zakelijke klant"
              className={`h-7 w-12 justify-center rounded-pill px-0.5 ${isBusiness ? "items-end bg-accent" : "items-start bg-border"}`}
            >
              <View className="h-6 w-6 rounded-full bg-white" />
            </Pressable>
          </CardRow>
          {isBusiness ? (
            <>
              <CardRow>
                <Text className="text-[15px] text-ink">KVK-nummer</Text>
                <TextInput
                  value={kvk}
                  onChangeText={setKvk}
                  placeholder="12345678"
                  placeholderTextColor="#b8b8bc"
                  keyboardType="number-pad"
                  className="w-32 text-right text-[15px] text-ink"
                  accessibilityLabel="KVK-nummer"
                />
              </CardRow>
              <CardRow isLast>
                <Text className="text-[15px] text-ink">BTW-nummer</Text>
                <TextInput
                  value={btw}
                  onChangeText={setBtw}
                  placeholder="NL123456789B01"
                  placeholderTextColor="#b8b8bc"
                  className="w-40 text-right text-[15px] text-ink"
                  accessibilityLabel="BTW-nummer"
                />
              </CardRow>
            </>
          ) : null}
        </Card>
        <Text className="ml-1 mt-2 text-[12px] leading-4 text-muted">
          Voor particuliere klanten (B2C) zijn KVK- en BTW-nummer niet verplicht op de factuur.
        </Text>
      </ScrollView>

      <View className="px-4 pb-6 pt-2">
        <SendButton
          state={canSave ? "idle" : "disabled"}
          label="Klant opslaan"
          accessibilityLabel="Klant opslaan"
          onPress={() => router.back()}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
