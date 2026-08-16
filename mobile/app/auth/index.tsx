import { useCallback, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Text, TextInput, useTheme } from "react-native-paper";

import { NotaLogoMark } from "@/components/brand/NotaLogoMark";
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
 * Every bare field inside a Card/CardRow uses this same "flat, borderless"
 * Paper TextInput styling — see PasswordInput.tsx for why. `underlineColor`
 * stays transparent so the field is borderless at rest, but
 * `activeUnderlineColor` is deliberately left unset (not "transparent")
 * rather than the field having no focus state at all: Paper reuses that
 * same color for the text cursor/selection highlight, not just the
 * underline, so forcing it to "transparent" made the caret itself invisible
 * while typing — the field looked broken, not just borderless. Leaving it
 * unset falls through to the theme's `primary` (the logo teal), so focus
 * shows a real teal underline + a visible cursor, same as any other Paper
 * field, while staying borderless when not focused.
 *
 * `dense` + a `min-h-11` (44px) floor via `className`, not `style`: Paper's
 * default (non-dense) TextInput is a fixed 56dp tall regardless of content,
 * which read as oversized next to the rest of the form. `dense` drops that
 * to 40dp; `min-h-11` puts a floor back under it so the field never shrinks
 * below the ~44pt minimum comfortable tap target — as a Tailwind class (not
 * `style.minHeight`) because NativeWind's cssInterop compiles `className`
 * to atomic CSS on web, and a raw numeric `minHeight` mixed into `style`
 * alongside a `className` on the same element trips its style merge
 * ("styleq: minHeight typeof 44 is not "string" or "null""). Applied
 * everywhere a bare field appears (see the identical comment in
 * CustomerForm.tsx etc.) so every form in the app uses one consistent
 * input height.
 */
const bareInputProps = {
  mode: "flat" as const,
  dense: true,
  underlineColor: "transparent",
  placeholderTextColor: "#b8b8bc",
  contentStyle: { paddingHorizontal: 0 },
  style: { backgroundColor: "transparent" },
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
  const theme = useTheme();
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
  //
  // Navigation after a successful auth is deliberately *reactive*, not
  // imperative: this used to call router.replace(mode === "signup" ?
  // "/onboarding/company" : "/") itself right after setUser(user). That
  // raced AuthGate's own declarative <Redirect> in app/_layout.tsx, which
  // recomputes its target the instant `user` changes — for a sign-in on an
  // account with no company profile yet, the two disagreed for a render
  // ("/" from here vs "/onboarding/company" from the gate), and expo-router
  // trying to honor both at once produced a "Maximum update depth exceeded"
  // crash straight to a blank screen. AuthGate already has everything it
  // needs (user + company) to pick the one correct destination, so it's now
  // the only thing that navigates — same single-source-of-truth pattern the
  // onboarding->app handoff already used (see that gate's comment).
  function submitForm() {
    const currentMode = mode;
    void handleSubmit(async (values) => {
      const user = await attemptAuth(values, currentMode);
      if (!user) return;
      // Brief pause so the success checkmark is actually visible before
      // AuthGate carries the user forward — same animation language as the
      // invoice send flow. Delaying setUser (not a navigation call) is what
      // delays the transition now.
      setTimeout(() => {
        setUser(user);
      }, 500);
    })();
  }

  const copy = COPY[mode];

  return (
    <KeyboardAvoidingView
      className="flex-1 justify-center bg-bg px-6"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="mb-4 items-center">
        <NotaLogoMark size={56} />
      </View>
      <Text variant="headlineSmall" style={{ textAlign: "center", fontWeight: "700", color: theme.colors.onSurface, marginBottom: 6 }}>
        Nota
      </Text>
      <Text variant="bodyMedium" style={{ textAlign: "center", color: theme.colors.onSurfaceVariant, marginBottom: 32 }}>
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

      <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4, marginBottom: 8 }}>
        E-mailadres
      </Text>
      <Card>
        <CardRow isLast>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <TextInput
                {...bareInputProps}
                value={field.value}
                onChangeText={(text) => {
                  field.onChange(text);
                  setErrorBanner(null);
                }}
                onBlur={field.onBlur}
                placeholder="jij@voorbeeld.nl"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                className="flex-1 min-h-11"
                accessibilityLabel="E-mailadres"
              />
            )}
          />
        </CardRow>
      </Card>
      {errors.email && email && email.length > 0 ? (
        <Text variant="bodySmall" style={{ color: theme.colors.error, marginLeft: 4, marginTop: 6 }}>
          {errors.email.message}
        </Text>
      ) : null}

      <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4, marginTop: 20, marginBottom: 8 }}>
        Wachtwoord
      </Text>
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
                autoCapitalize="none"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                accessibilityLabel="Wachtwoord"
              />
            )}
          />
        </CardRow>
      </Card>
      {mode === "signup" ? <PasswordStrengthMeter password={password ?? ""} /> : null}
      {errors.password && password && password.length > 0 ? (
        <Text variant="bodySmall" style={{ color: theme.colors.error, marginLeft: 4, marginTop: 6 }}>
          {errors.password.message}
        </Text>
      ) : null}

      {mode === "login" ? (
        <Button
          mode="text"
          onPress={() => router.push("/auth/forgot-password")}
          accessibilityLabel="Wachtwoord vergeten"
          compact
          contentStyle={{ justifyContent: "flex-end" }}
          style={{ marginTop: 12, alignSelf: "flex-end" }}
          labelStyle={{ fontSize: 13 }}
        >
          Wachtwoord vergeten?
        </Button>
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
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {mode === "signup" ? "Heb je al een account? " : "Nog geen account? "}
          <Text variant="bodySmall" style={{ fontWeight: "600", color: theme.colors.primary }}>
            {mode === "signup" ? "Inloggen" : "Registreren"}
          </Text>
        </Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}
