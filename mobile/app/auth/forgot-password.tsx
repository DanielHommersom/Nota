import { useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Check } from "lucide-react-native";
import { Button, IconButton, Text, TextInput, useTheme } from "react-native-paper";
import { Card, CardRow } from "@/components/ui/Card";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { AsyncActionButton, type AsyncButtonState } from "@/components/ui/AsyncActionButton";
import * as authService from "@/features/auth/authService";

/**
 * "Wachtwoord vergeten" — previously not started at all
 * (FRONTEND-CHECKLIST.md: "Password reset flow ... not yet started").
 * Same email + password design language as auth/index.tsx (headerless,
 * centered card) rather than a system header, so the whole auth section
 * reads as one flow.
 *
 * Since there's no real mail delivery in the mock layer, "Check je e-mail"
 * includes a dev shortcut straight to reset-password — standing in for
 * "the user tapped the link in their inbox" without actually needing one.
 */
export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const buttonState: AsyncButtonState = state === "sending" ? "sending" : isValidEmail ? "idle" : "disabled";

  async function submit() {
    setState("sending");
    setError(null);
    const result = await authService.requestPasswordReset({ email: email.trim() });
    if (result.error) {
      setError(result.error.message);
      setState("idle");
      return;
    }
    setState("sent");
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 justify-center bg-bg px-6"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <IconButton
        icon={({ size }) => <ArrowLeft color={theme.colors.onSurface} size={size} />}
        onPress={() => router.back()}
        accessibilityLabel="Terug naar inloggen"
        style={{ position: "absolute", left: 8, top: 48 }}
      />

      {state === "sent" ? (
        <View className="items-center">
          <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-success-soft">
            <Check color={theme.colors.tertiary} size={28} strokeWidth={2.5} />
          </View>
          <Text variant="titleLarge" style={{ textAlign: "center", fontWeight: "700", color: theme.colors.onSurface, marginBottom: 6 }}>
            Check je e-mail
          </Text>
          <Text variant="bodyMedium" style={{ textAlign: "center", color: theme.colors.onSurfaceVariant, marginBottom: 24, lineHeight: 20 }}>
            Als er een account bestaat voor {email.trim()}, sturen we een link om je wachtwoord opnieuw in te
            stellen.
          </Text>
          <Button mode="text" onPress={() => router.push("/auth/reset-password")} accessibilityLabel="Ik heb de e-mail geopend, wachtwoord opnieuw instellen">
            Link geopend? Stel je wachtwoord opnieuw in
          </Button>
        </View>
      ) : (
        <>
          <Text variant="headlineSmall" style={{ textAlign: "center", fontWeight: "700", color: theme.colors.onSurface, marginBottom: 6 }}>
            Wachtwoord vergeten?
          </Text>
          <Text variant="bodyMedium" style={{ textAlign: "center", color: theme.colors.onSurfaceVariant, marginBottom: 32 }}>
            Vul je e-mailadres in — we sturen je een link om een nieuw wachtwoord in te stellen.
          </Text>

          {error ? (
            <StatusBanner kind="failed" message={error} containerClassName="mb-4" onRetry={submit} />
          ) : null}

          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4, marginBottom: 8 }}>
            E-mailadres
          </Text>
          <Card>
            <CardRow isLast>
              <TextInput
                mode="flat"
                dense
                // dense + min-h-11 (44px, via className below) — see the
                // bareInputProps comment in app/auth/index.tsx: Paper's
                // non-dense default is a fixed 56dp, which read as oversized;
                // dense + a 44pt floor keeps this field the same height as
                // every other bare field. The floor is a Tailwind class, not
                // style.minHeight — a raw number there conflicts with
                // NativeWind's className compilation on web.
                underlineColor="transparent"
                // Not "transparent" — see the bareInputProps comment in
                // app/auth/index.tsx: this color also drives the text
                // cursor, so leaving it unset (theme primary) keeps the
                // caret visible instead of hiding it while typing.
                placeholderTextColor="#b8b8bc"
                contentStyle={{ paddingHorizontal: 0 }}
                style={{ backgroundColor: "transparent" }}
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setError(null);
                }}
                placeholder="jij@voorbeeld.nl"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                className="flex-1 min-h-11"
                accessibilityLabel="E-mailadres"
              />
            </CardRow>
          </Card>

          <View className="mt-6">
            <AsyncActionButton
              state={buttonState}
              label="Verstuur resetlink"
              sendingLabel="Bezig…"
              accessibilityLabel="Verstuur resetlink"
              onPress={submit}
            />
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}
