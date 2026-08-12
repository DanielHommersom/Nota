import { useCallback, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardRow } from "@/components/ui/Card";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { AsyncActionButton, type AsyncButtonState } from "@/components/ui/AsyncActionButton";
import { useAuth } from "@/features/auth/AuthContext";
import * as authService from "@/features/auth/authService";
import { authFormSchema, type AuthFormValues } from "@/features/auth/schema";
import { PasswordStrengthMeter } from "@/features/auth/PasswordStrengthMeter";
import type { AuthErrorCode, AuthUser } from "@/features/auth/types";

type Mode = "signup" | "login";
type ErrorBanner = { kind: "offline-retrying" | "failed"; message: string; code: AuthErrorCode };

const COPY: Record<Mode, { heading: string; submitLabel: string; sendingLabel: string }> = {
  signup: { heading: "Account aanmaken", submitLabel: "Account aanmaken", sendingLabel: "Bezig…" },
  login: { heading: "Inloggen", submitLabel: "Inloggen", sendingLabel: "Bezig…" },
};

/**
 * The very first screen a new user sees. Default mode is signup, never
 * login — a fresh install has no account to log into yet. Email + password
 * (not magic link): the target user is often on a job site with marginal
 * signal, where a magic link means leaving the app, waiting on mail
 * delivery over a possibly slow connection, then switching back — real
 * friction for exactly the audience this app is built for. A password
 * field is fully self-contained and only needs connectivity for the final
 * submit, consistent with how the rest of the app treats poor signal as
 * the default case, not the exception.
 */
export default function AuthScreen() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [mode, setMode] = useState<Mode>("signup");
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "success">("idle");
  const [errorBanner, setErrorBanner] = useState<ErrorBanner | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: { email: "", password: "" },
    // Live validation while typing, per spec — not onBlur like the invoice
    // form. A password strength meter in particular needs to react per
    // keystroke, not just on blur.
    mode: "onChange",
  });

  // useWatch, not watch()+useMemo — the latter went silently stale on the
  // invoice form earlier in this project for the exact same nested-value
  // reason; see that commit if this pattern is ever "simplified" back.
  const email = useWatch({ control, name: "email" });
  const password = useWatch({ control, name: "password" });
  const isFormValid = authFormSchema.safeParse({ email, password }).success;

  const buttonState: AsyncButtonState =
    submitState === "success" ? "success" : submitState === "sending" ? "sending" : isFormValid ? "idle" : "disabled";

  function toggleMode() {
    const next: Mode = mode === "signup" ? "login" : "signup";
    setMode(next);
    setErrorBanner(null);
    // Keep the email (useful if "e-mail al in gebruik" is why they're
    // switching to login) but clear the password on principle.
    reset({ email: email ?? "", password: "" });
  }

  // Empty, stable dependency array on purpose: values that used to be
  // closed-over component state (which mode, which navigation target) are
  // now call-time parameters instead, exactly like the invoice form's
  // onSubmit — closing over reference-typed state here previously tripped
  // React Compiler's manual-memoization-preservation check.
  const attemptAuth = useCallback(async (values: AuthFormValues, currentMode: Mode): Promise<AuthUser | null> => {
    setSubmitState("sending");
    setErrorBanner(null);

    const result =
      currentMode === "signup" ? await authService.signUp(values) : await authService.signInWithPassword(values);

    if (result.error || !result.data.user) {
      const code = result.error?.code ?? "unknown";
      setErrorBanner({
        kind: code === "network_error" ? "offline-retrying" : "failed",
        message: result.error?.message ?? "Er ging iets mis. Probeer het opnieuw.",
        code,
      });
      setSubmitState("idle");
      return null;
    }

    setSubmitState("success");
    return result.data.user;
  }, []);

  // Deferring handleSubmit(...) into a plain wrapper only ever reached via
  // onPress (not called inline in JSX) is what keeps the impure/ref-safety
  // analyzer from flagging attemptAuth's contents as "might run during
  // render" — same reasoning as the invoice create screen.
  function submitForm() {
    const currentMode = mode;
    void handleSubmit(async (values) => {
      const user = await attemptAuth(values, currentMode);
      if (!user) return;
      setUser(user);
      // Brief pause so the success checkmark is actually visible before
      // navigating away — same animation language as the invoice send flow.
      setTimeout(() => {
        router.replace(currentMode === "signup" ? "/onboarding/company" : "/");
      }, 500);
    })();
  }

  const copy = COPY[mode];

  return (
    <KeyboardAvoidingView
      className="flex-1 justify-center bg-bg px-6"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text className="mb-1.5 text-center text-[24px] font-bold tracking-tight text-ink">Nota</Text>
      <Text className="mb-8 text-center text-[14px] text-muted">
        De snelste manier om een factuur te versturen.
      </Text>

      {errorBanner ? (
        <StatusBanner
          kind={errorBanner.kind}
          message={errorBanner.message}
          containerClassName="mb-4"
          retryLabel={errorBanner.code === "email_taken" ? "Inloggen" : "Opnieuw proberen"}
          onRetry={
            errorBanner.code === "email_taken" ? toggleMode : errorBanner.code === "network_error" ? submitForm : undefined
          }
        />
      ) : null}

      <Text className="mb-2 ml-1 text-[12px] font-semibold uppercase tracking-wide text-muted">E-mailadres</Text>
      <Card>
        <CardRow isLast>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <TextInput
                value={field.value}
                onChangeText={(text) => {
                  field.onChange(text);
                  setErrorBanner(null);
                }}
                onBlur={field.onBlur}
                placeholder="jij@voorbeeld.nl"
                placeholderTextColor="#b8b8bc"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                className="min-h-11 flex-1 text-[15px] text-ink"
                accessibilityLabel="E-mailadres"
              />
            )}
          />
        </CardRow>
      </Card>
      {errors.email && email && email.length > 0 ? (
        <Text className="ml-1 mt-1.5 text-[12px] text-warn">{errors.email.message}</Text>
      ) : null}

      <Text className="mb-2 ml-1 mt-5 text-[12px] font-semibold uppercase tracking-wide text-muted">Wachtwoord</Text>
      <Card>
        <CardRow isLast>
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <PasswordInput
                value={field.value}
                onChangeText={(text) => {
                  field.onChange(text);
                  setErrorBanner(null);
                }}
                onBlur={field.onBlur}
                placeholder="Minimaal 8 tekens"
                placeholderTextColor="#b8b8bc"
                autoCapitalize="none"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="min-h-11"
                accessibilityLabel="Wachtwoord"
              />
            )}
          />
        </CardRow>
      </Card>
      {mode === "signup" ? <PasswordStrengthMeter password={password ?? ""} /> : null}
      {errors.password && password && password.length > 0 ? (
        <Text className="ml-1 mt-1.5 text-[12px] text-warn">{errors.password.message}</Text>
      ) : null}

      <View className="mt-6">
        <AsyncActionButton
          state={buttonState}
          label={copy.submitLabel}
          sendingLabel={copy.sendingLabel}
          successLabel="Gelukt!"
          accessibilityLabel={copy.heading}
          onPress={submitForm}
        />
      </View>

      <Pressable
        onPress={toggleMode}
        accessibilityRole="button"
        accessibilityLabel={mode === "signup" ? "Inloggen met bestaand account" : "Nieuw account registreren"}
        className="mt-4 min-h-11 items-center justify-center"
      >
        <Text className="text-[13px] text-muted">
          {mode === "signup" ? "Heb je al een account? " : "Nog geen account? "}
          <Text className="font-semibold text-accent">{mode === "signup" ? "Inloggen" : "Registreren"}</Text>
        </Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}
