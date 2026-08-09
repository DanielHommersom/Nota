import { useState } from "react";
import { KeyboardAvoidingView, Platform, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { SendButton } from "@/components/ui/SendButton";

/**
 * Front-end baseline stub — not yet wired to Supabase Auth (T1/T4,
 * /plan-eng-review). Structurally where email/magic-link or
 * email+password sign-in will live.
 */
export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const canContinue = /\S+@\S+\.\S+/.test(email);

  return (
    <KeyboardAvoidingView
      className="flex-1 justify-center bg-bg px-6"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text className="mb-1.5 text-center text-[24px] font-bold tracking-tight text-ink">Nota</Text>
      <Text className="mb-8 text-center text-[14px] text-muted">
        De snelste manier om een factuur te versturen.
      </Text>

      <View className="rounded-card border border-border bg-card px-4">
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="jij@voorbeeld.nl"
          placeholderTextColor="#b8b8bc"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          className="h-14 text-[15px] text-ink"
          accessibilityLabel="E-mailadres"
        />
      </View>

      <View className="mt-4">
        <SendButton
          state={canContinue ? "idle" : "disabled"}
          label="Doorgaan"
          accessibilityLabel="Doorgaan met e-mailadres"
          onPress={() => router.replace("/onboarding/company")}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
