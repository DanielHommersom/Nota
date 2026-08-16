import { useState } from "react";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Card, CardRow } from "@/components/ui/Card";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PasswordStrengthMeter } from "@/features/auth/PasswordStrengthMeter";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { AsyncActionButton, type AsyncButtonState } from "@/components/ui/AsyncActionButton";
import { calculatePasswordStrength } from "@/features/auth/passwordStrength";
import * as authService from "@/features/auth/authService";

/**
 * Second half of the "wachtwoord vergeten" flow — reached either via the
 * dev shortcut on forgot-password.tsx or (once real email delivery
 * exists) a deep link with a reset token. No token handling yet: the mock
 * `authService.resetPassword` doesn't need one, matching how the rest of
 * this app's auth mock works (see authService.ts's own comment on this).
 */
export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  const strength = calculatePasswordStrength(password);
  const isValid = strength !== "empty" && strength !== "weak" && password === confirm;
  const showMismatch = confirm.length > 0 && password !== confirm;
  const buttonState: AsyncButtonState = state === "sending" ? "sending" : state === "success" ? "success" : isValid ? "idle" : "disabled";

  async function submit() {
    setState("sending");
    setError(null);
    const result = await authService.resetPassword({ password });
    if (result.error) {
      setError(result.error.message);
      setState("idle");
      return;
    }
    setState("success");
    setTimeout(() => router.replace("/auth"), 900);
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 justify-center bg-bg px-6"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text className="mb-1.5 text-center text-[24px] font-bold tracking-tight text-ink">Nieuw wachtwoord</Text>
      <Text className="mb-8 text-center text-[14px] text-muted">Kies een nieuw wachtwoord voor je account.</Text>

      {error ? <StatusBanner kind="failed" message={error} containerClassName="mb-4" onRetry={submit} /> : null}

      <Text className="mb-2 ml-1 text-[12px] font-semibold uppercase tracking-wide text-muted">Nieuw wachtwoord</Text>
      <Card>
        <CardRow isLast>
          <PasswordInput
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              setError(null);
            }}
            placeholder="Minimaal 8 tekens"
            placeholderTextColor="#b8b8bc"
            autoCapitalize="none"
            autoComplete="new-password"
            className="min-h-11"
            accessibilityLabel="Nieuw wachtwoord"
          />
        </CardRow>
      </Card>
      <PasswordStrengthMeter password={password} />

      <Text className="mb-2 ml-1 mt-5 text-[12px] font-semibold uppercase tracking-wide text-muted">
        Bevestig wachtwoord
      </Text>
      <Card>
        <CardRow isLast>
          <PasswordInput
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Herhaal je wachtwoord"
            placeholderTextColor="#b8b8bc"
            autoCapitalize="none"
            autoComplete="new-password"
            className="min-h-11"
            accessibilityLabel="Bevestig wachtwoord"
          />
        </CardRow>
      </Card>
      {showMismatch ? <Text className="ml-1 mt-1.5 text-[12px] text-warn">Wachtwoorden komen niet overeen</Text> : null}

      <View className="mt-6">
        <AsyncActionButton
          state={buttonState}
          label="Wachtwoord opslaan"
          sendingLabel="Bezig…"
          successLabel="Opgeslagen!"
          accessibilityLabel="Nieuw wachtwoord opslaan"
          onPress={submit}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
