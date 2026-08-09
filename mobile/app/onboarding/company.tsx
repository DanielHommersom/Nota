import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Card, CardRow } from "@/components/ui/Card";
import { SendButton } from "@/components/ui/SendButton";

/**
 * Front-end baseline stub for the one-time company onboarding step.
 * Not yet wired to Supabase (T1, /plan-eng-review).
 */
export default function CompanyOnboardingScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [kvk, setKvk] = useState("");
  const [btw, setBtw] = useState("");
  const [korExempt, setKorExempt] = useState(false);

  const canContinue = name.trim().length > 0 && kvk.trim().length > 0;

  return (
    <KeyboardAvoidingView className="flex-1 bg-bg" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="mb-1 text-[15px] leading-5 text-muted">
          Deze gegevens komen op elke factuur te staan. Je hoeft dit maar één keer in te vullen.
        </Text>

        <Text className="mb-2 ml-1 mt-5 text-[12px] font-semibold uppercase tracking-wide text-muted">
          Bedrijfsgegevens
        </Text>
        <Card>
          <CardRow>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Bedrijfsnaam"
              placeholderTextColor="#b8b8bc"
              className="flex-1 text-[15px] text-ink"
              accessibilityLabel="Bedrijfsnaam"
            />
          </CardRow>
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
        </Card>

        <Text className="mb-2 ml-1 mt-5 text-[12px] font-semibold uppercase tracking-wide text-muted">
          BTW-vrijstelling
        </Text>
        <Card>
          <CardRow isLast>
            <View className="flex-1 pr-3">
              <Text className="text-[15px] text-ink">Kleineondernemersregeling (KOR)</Text>
              <Text className="mt-0.5 text-[12px] leading-4 text-muted">
                Zet dit aan als je bij de Belastingdienst bent vrijgesteld van BTW. Twijfel je? Dit staat op je
                KOR-bevestigingsbrief — laat het anders uit.
              </Text>
            </View>
            <Pressable
              onPress={() => setKorExempt((v) => !v)}
              accessibilityRole="switch"
              accessibilityState={{ checked: korExempt }}
              accessibilityLabel="Vrijgesteld van BTW via de kleineondernemersregeling"
              className={`h-7 w-12 justify-center rounded-pill px-0.5 ${korExempt ? "items-end bg-accent" : "items-start bg-border"}`}
            >
              <View className="h-6 w-6 rounded-full bg-white" />
            </Pressable>
          </CardRow>
        </Card>
      </ScrollView>

      <View className="px-4 pb-6 pt-2">
        <SendButton
          state={canContinue ? "idle" : "disabled"}
          label="Doorgaan"
          accessibilityLabel="Bedrijfsgegevens opslaan en doorgaan"
          onPress={() => router.replace("/")}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
