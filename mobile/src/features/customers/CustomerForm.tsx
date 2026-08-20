import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { Switch, Text, TextInput, useTheme } from "react-native-paper";
import { Card, CardRow } from "@/components/ui/Card";
import { AsyncActionButton, type AsyncButtonState } from "@/components/ui/AsyncActionButton";
import { customerFormSchema, type CustomerFormValues } from "./schema";

type Props = {
  defaultValues: CustomerFormValues;
  onSubmit: (values: CustomerFormValues) => void;
  submitLabel: string;
  isSubmitting?: boolean;
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
 * Shared between the "on the fly" quick-add (app/customer/new.tsx, reached
 * mid invoice-create — Nota's core 30-second promise means this can't ask
 * for more than it needs) and the standalone Klanten list add/edit flow.
 * Address/notes stay behind an optional "meer details" disclosure so the
 * on-the-fly path is never slowed down by fields nobody needs to fill in
 * at the job site, while the full record is still one tap away for anyone
 * who wants it (e.g. editing later from the Klanten screen).
 */
export function CustomerForm({ defaultValues, onSubmit, submitLabel, isSubmitting, footer }: Props) {
  const theme = useTheme();
  const [showMore, setShowMore] = useState(
    Boolean(defaultValues.address || defaultValues.postcode || defaultValues.city || defaultValues.notes),
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues,
    mode: "onBlur",
  });

  const name = useWatch({ control, name: "name" });
  const isBusiness = useWatch({ control, name: "isBusiness" });
  const canSave = (name ?? "").trim().length > 0;

  function submit() {
    void handleSubmit(onSubmit)();
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-bg" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4, marginBottom: 8 }}>
          Klantgegevens
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
                  placeholder="Naam klant"
                  className="flex-1 min-h-11"
                  accessibilityLabel="Naam van de klant"
                />
              )}
            />
          </CardRow>
          <CardRow isLast>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <TextInput
                  {...bareInputProps}
                  value={field.value ?? ""}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="E-mailadres (optioneel)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="flex-1 min-h-11"
                  accessibilityLabel="E-mailadres van de klant"
                />
              )}
            />
          </CardRow>
        </Card>
        {errors.email ? (
          <Text variant="bodySmall" style={{ color: theme.colors.error, marginLeft: 4, marginTop: 6 }}>
            {errors.email.message}
          </Text>
        ) : null}

        <Text
          variant="labelMedium"
          style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4, marginTop: 20, marginBottom: 8 }}
        >
          Type klant
        </Text>
        <Card>
          <CardRow isLast={!isBusiness}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
              Zakelijke klant (B2B)
            </Text>
            <Controller
              control={control}
              name="isBusiness"
              render={({ field }) => (
                <Switch
                  value={field.value}
                  onValueChange={field.onChange}
                  accessibilityLabel="Zakelijke klant"
                />
              )}
            />
          </CardRow>
          {isBusiness ? (
            <>
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
                      value={field.value ?? ""}
                      onChangeText={field.onChange}
                      placeholder="12345678"
                      keyboardType="number-pad"
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
                      placeholder="NL123456789B01"
                      autoCapitalize="characters"
                      className="w-40 min-h-11"
                      style={[bareInputProps.style, { textAlign: "right" }]}
                      accessibilityLabel="BTW-nummer"
                    />
                  )}
                />
              </CardRow>
            </>
          ) : null}
        </Card>
        {!isBusiness ? (
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4, marginTop: 8, lineHeight: 16 }}>
            Voor particuliere klanten (B2C) zijn KVK- en BTW-nummer niet verplicht op de factuur.
          </Text>
        ) : null}

        <Pressable
          onPress={() => setShowMore((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={showMore ? "Adresgegevens verbergen" : "Adresgegevens toevoegen"}
          className="mt-5 min-h-11 flex-row items-center gap-1.5"
        >
          {showMore ? (
            <ChevronUp color={theme.colors.primary} size={16} />
          ) : (
            <ChevronDown color={theme.colors.primary} size={16} />
          )}
          <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
            {showMore ? "Minder details" : "Adres toevoegen (optioneel)"}
          </Text>
        </Pressable>

        {showMore ? (
          <Card className="mt-2">
            <CardRow>
              <Controller
                control={control}
                name="address"
                render={({ field }) => (
                  <TextInput
                    {...bareInputProps}
                    value={field.value ?? ""}
                    onChangeText={field.onChange}
                    placeholder="Straat en huisnummer"
                    className="flex-1 min-h-11"
                    accessibilityLabel="Straat en huisnummer"
                  />
                )}
              />
            </CardRow>
            <CardRow>
              <Controller
                control={control}
                name="postcode"
                render={({ field }) => (
                  <TextInput
                    {...bareInputProps}
                    value={field.value ?? ""}
                    onChangeText={field.onChange}
                    placeholder="Postcode"
                    autoCapitalize="characters"
                    className="flex-1 min-h-11"
                    accessibilityLabel="Postcode"
                  />
                )}
              />
            </CardRow>
            <CardRow isLast>
              <Controller
                control={control}
                name="city"
                render={({ field }) => (
                  <TextInput
                    {...bareInputProps}
                    value={field.value ?? ""}
                    onChangeText={field.onChange}
                    placeholder="Plaats"
                    className="flex-1 min-h-11"
                    accessibilityLabel="Plaats"
                  />
                )}
              />
            </CardRow>
          </Card>
        ) : null}

        {footer}
      </ScrollView>

      <View className="px-4 pb-6 pt-2">
        <AsyncActionButton
          state={(isSubmitting ? "sending" : canSave ? "idle" : "disabled") as AsyncButtonState}
          label={submitLabel}
          accessibilityLabel={submitLabel}
          onPress={submit}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
