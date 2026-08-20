import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch, Text, TextInput, useTheme } from "react-native-paper";
import { Card, CardRow } from "@/components/ui/Card";
import { AsyncActionButton, type AsyncButtonState } from "@/components/ui/AsyncActionButton";
import { companyProfileFormSchema, type CompanyProfileFormValues } from "./schema";

type Props = {
  defaultValues: CompanyProfileFormValues;
  onSubmit: (values: CompanyProfileFormValues) => void;
  submitLabel: string;
  isSubmitting?: boolean;
  /** Onboarding shows an intro sentence; the edit screen doesn't need it repeated. */
  introCopy?: string;
  footer?: React.ReactNode;
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
 * which read as oversized next to the rest of the form (e.g. "Naam klant").
 * `dense` drops that to 40dp; `min-h-11` puts a floor back under it so the
 * field never shrinks below the ~44pt minimum comfortable tap target — as a
 * Tailwind class (not `style.minHeight`) because NativeWind's cssInterop
 * compiles `className` to atomic CSS on web, and a raw numeric `minHeight`
 * mixed into `style` alongside a `className` on the same element trips its
 * style merge ("styleq: minHeight typeof 44 is not "string" or "null"").
 * Every call site below appends `min-h-11` to its existing width className
 * for this reason. Applied everywhere a bare field appears so every form in
 * the app uses one consistent input height.
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
 * Shared between the one-time onboarding step (app/onboarding/company.tsx)
 * and the later "edit bedrijfsprofiel" settings screen
 * (app/company-profile/edit.tsx) — the exact fields the frontend checklist
 * flagged as missing a way back into ("no way back in to fix a typo in
 * your KVK-nummer later") now live in one place instead of two forks.
 *
 * KOR copy follows TODOS.md's "Make KOR-exemption setting understandable"
 * item: plain-language explanation next to the toggle, not a bare boolean —
 * that boolean is now Paper's <Switch> instead of a hand-rolled pill.
 */
export function CompanyProfileForm({ defaultValues, onSubmit, submitLabel, isSubmitting, introCopy, footer }: Props) {
  const theme = useTheme();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileFormSchema),
    defaultValues,
    mode: "onBlur",
  });

  const [korExemptWatch, setKorExemptWatch] = useState(defaultValues.korExempt);

  const name = useWatch({ control, name: "name" });
  const kvkNummer = useWatch({ control, name: "kvkNummer" });
  const address = useWatch({ control, name: "address" });
  const isFormValid = companyProfileFormSchema.safeParse({
    name,
    kvkNummer,
    btwNummer: "",
    korExempt: korExemptWatch,
    address,
  }).success;

  function submit() {
    void handleSubmit((values) => onSubmit({ ...values, korExempt: korExemptWatch }))();
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-bg" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        {introCopy ? (
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 4 }}>
            {introCopy}
          </Text>
        ) : null}

        <Text
          variant="labelMedium"
          style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4, marginTop: 20, marginBottom: 8 }}
        >
          Bedrijfsgegevens
        </Text>
        <Card>
          <CardRow>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <TextInput
                  {...bareInputProps}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Bedrijfsnaam"
                  className="flex-1 min-h-11"
                  accessibilityLabel="Bedrijfsnaam"
                />
              )}
            />
          </CardRow>
          <CardRow>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
              KVK-nummer
            </Text>
            <Controller
              control={control}
              name="kvkNummer"
              render={({ field }) => (
                <TextInput
                  {...bareInputProps}
                  value={field.value}
                  onChangeText={(t) => field.onChange(t.replace(/[^0-9]/g, ""))}
                  onBlur={field.onBlur}
                  placeholder="12345678"
                  keyboardType="number-pad"
                  maxLength={8}
                  className="w-32 min-h-11"
                  style={[bareInputProps.style, { textAlign: "right" }]}
                  accessibilityLabel="KVK-nummer"
                />
              )}
            />
          </CardRow>
          <CardRow isLast>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
              BTW-nummer
            </Text>
            <Controller
              control={control}
              name="btwNummer"
              render={({ field }) => (
                <TextInput
                  {...bareInputProps}
                  value={field.value ?? ""}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="NL123456789B01"
                  autoCapitalize="characters"
                  className="w-40 min-h-11"
                  style={[bareInputProps.style, { textAlign: "right" }]}
                  accessibilityLabel="BTW-nummer"
                />
              )}
            />
          </CardRow>
        </Card>
        {errors.name && name ? (
          <Text variant="bodySmall" style={{ color: theme.colors.error, marginLeft: 4, marginTop: 6 }}>
            {errors.name.message}
          </Text>
        ) : null}
        {errors.kvkNummer ? (
          <Text variant="bodySmall" style={{ color: theme.colors.error, marginLeft: 4, marginTop: 6 }}>
            {errors.kvkNummer.message}
          </Text>
        ) : null}

        <Text
          variant="labelMedium"
          style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4, marginTop: 20, marginBottom: 8 }}
        >
          Adres
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4, marginBottom: 8, lineHeight: 16 }}>
          Komt op elke factuur te staan — een geldig factuuradres is wettelijk verplicht.
        </Text>
        <Card>
          <CardRow>
            <Controller
              control={control}
              name="address.street"
              render={({ field }) => (
                <TextInput
                  {...bareInputProps}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Straatnaam"
                  className="flex-1 min-h-11"
                  accessibilityLabel="Straatnaam"
                />
              )}
            />
          </CardRow>
          <CardRow>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
              Huisnummer
            </Text>
            <Controller
              control={control}
              name="address.houseNumber"
              render={({ field }) => (
                <TextInput
                  {...bareInputProps}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="12A"
                  className="w-32 min-h-11"
                  style={[bareInputProps.style, { textAlign: "right" }]}
                  accessibilityLabel="Huisnummer"
                />
              )}
            />
          </CardRow>
          <CardRow>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
              Postcode
            </Text>
            <Controller
              control={control}
              name="address.postcode"
              render={({ field }) => (
                <TextInput
                  {...bareInputProps}
                  value={field.value}
                  onChangeText={(t) => field.onChange(t.toUpperCase())}
                  onBlur={field.onBlur}
                  placeholder="1234 AB"
                  autoCapitalize="characters"
                  className="w-32 min-h-11"
                  style={[bareInputProps.style, { textAlign: "right" }]}
                  accessibilityLabel="Postcode"
                />
              )}
            />
          </CardRow>
          <CardRow isLast>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
              Plaats
            </Text>
            <Controller
              control={control}
              name="address.city"
              render={({ field }) => (
                <TextInput
                  {...bareInputProps}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Amsterdam"
                  className="w-40 min-h-11"
                  style={[bareInputProps.style, { textAlign: "right" }]}
                  accessibilityLabel="Plaats"
                />
              )}
            />
          </CardRow>
        </Card>
        {errors.address?.street || errors.address?.houseNumber || errors.address?.postcode || errors.address?.city ? (
          <Text variant="bodySmall" style={{ color: theme.colors.error, marginLeft: 4, marginTop: 6 }}>
            {errors.address.street?.message ??
              errors.address.houseNumber?.message ??
              errors.address.postcode?.message ??
              errors.address.city?.message}
          </Text>
        ) : null}

        <Text
          variant="labelMedium"
          style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4, marginTop: 20, marginBottom: 8 }}
        >
          BTW-vrijstelling
        </Text>
        <Card>
          <CardRow isLast>
            <View className="flex-1 pr-3">
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                Kleineondernemersregeling (KOR)
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2, lineHeight: 16 }}>
                Zet dit aan als je bij de Belastingdienst bent vrijgesteld van BTW. Twijfel je? Dit staat op je
                KOR-bevestigingsbrief — laat het anders uit. Met KOR reken je geen BTW en tonen we automatisch de
                juiste wettelijke tekst op je facturen in plaats van een BTW-regel.
              </Text>
            </View>
            <Switch
              value={korExemptWatch}
              onValueChange={setKorExemptWatch}
              accessibilityLabel="Vrijgesteld van BTW via de kleineondernemersregeling"
            />
          </CardRow>
        </Card>

        {footer}
      </ScrollView>

      <View className="px-4 pb-6 pt-2">
        <AsyncActionButton
          state={(isSubmitting ? "sending" : isFormValid ? "idle" : "disabled") as AsyncButtonState}
          label={submitLabel}
          accessibilityLabel={submitLabel}
          onPress={submit}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
