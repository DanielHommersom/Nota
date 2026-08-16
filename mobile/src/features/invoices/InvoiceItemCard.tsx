import { View } from "react-native";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react-native";
import { IconButton, Text, TextInput, useTheme } from "react-native-paper";
import { Card, CardRow } from "@/components/ui/Card";
import { VatRatePicker } from "./VatRatePicker";
import { parseEuroInputToCents } from "@/lib/currency";
import type { InvoiceFormValues, InvoiceItemFormValues } from "./schema";

type Props = {
  control: Control<InvoiceFormValues>;
  index: number;
  errors: FieldErrors<InvoiceItemFormValues> | undefined;
  canRemove: boolean;
  onRemove: () => void;
  /** Herordenen (item 15) — undefined/disabled at the array's boundaries. */
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  priceInput: string;
  onPriceInputChange: (text: string) => void;
  label: string;
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
 */
const bareInputProps = {
  mode: "flat" as const,
  underlineColor: "transparent",
  placeholderTextColor: "#b8b8bc",
  contentStyle: { paddingHorizontal: 0 },
  style: { backgroundColor: "transparent" },
};

/** One editable line item — repeated per row in the invoice create form's field array. The up/down/remove row controls are now Paper's <IconButton>, which is exactly a small circular icon-only tap target like these used to be hand-rolled as. */
export function InvoiceItemCard({
  control,
  index,
  errors,
  canRemove,
  onRemove,
  onMoveUp,
  onMoveDown,
  priceInput,
  onPriceInputChange,
  label,
}: Props) {
  const theme = useTheme();

  return (
    <View className="mb-3">
      <View className="mb-2 ml-1 flex-row items-center justify-between">
        <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {label}
        </Text>
        <View className="flex-row items-center gap-1">
          <IconButton
            icon={({ size, color }) => <ChevronUp color={color} size={size} />}
            onPress={onMoveUp}
            disabled={!onMoveUp}
            size={16}
            accessibilityLabel={`Regel ${index + 1} omhoog verplaatsen`}
          />
          <IconButton
            icon={({ size, color }) => <ChevronDown color={color} size={size} />}
            onPress={onMoveDown}
            disabled={!onMoveDown}
            size={16}
            accessibilityLabel={`Regel ${index + 1} omlaag verplaatsen`}
          />
          {canRemove ? (
            <IconButton
              icon={({ size }) => <Trash2 color={theme.colors.error} size={size} />}
              onPress={onRemove}
              size={16}
              accessibilityLabel={`Regel ${index + 1} verwijderen`}
            />
          ) : null}
        </View>
      </View>

      <Card>
        <CardRow>
          <Controller
            control={control}
            name={`items.${index}.description`}
            render={({ field }) => (
              <TextInput
                {...bareInputProps}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                placeholder="Bijv. Stucwerk woonkamer"
                className="flex-1"
                accessibilityLabel={`Omschrijving van regel ${index + 1}`}
              />
            )}
          />
        </CardRow>
        <CardRow>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
            Aantal
          </Text>
          <Controller
            control={control}
            name={`items.${index}.quantity`}
            render={({ field }) => (
              <TextInput
                {...bareInputProps}
                value={String(field.value ?? 1)}
                onChangeText={(t) => field.onChange(Number(t.replace(/[^0-9]/g, "")) || 1)}
                keyboardType="number-pad"
                className="w-16"
                style={[bareInputProps.style, { textAlign: "right" }]}
                accessibilityLabel={`Aantal voor regel ${index + 1}`}
              />
            )}
          />
        </CardRow>
        <CardRow>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
            Prijs
          </Text>
          <Controller
            control={control}
            name={`items.${index}.unitPriceCents`}
            render={({ field }) => (
              <TextInput
                {...bareInputProps}
                value={priceInput}
                onChangeText={(t) => {
                  onPriceInputChange(t);
                  field.onChange(parseEuroInputToCents(t) ?? 0);
                }}
                placeholder="0,00"
                keyboardType="decimal-pad"
                className="w-24"
                style={[bareInputProps.style, { textAlign: "right" }]}
                accessibilityLabel={`Prijs per stuk voor regel ${index + 1}`}
              />
            )}
          />
        </CardRow>
        <CardRow isLast>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
            BTW
          </Text>
          <View className="w-52">
            <Controller
              control={control}
              name={`items.${index}.vatRate`}
              render={({ field }) => <VatRatePicker value={field.value} onChange={field.onChange} />}
            />
          </View>
        </CardRow>
      </Card>
      {errors?.description ? (
        <Text variant="bodySmall" style={{ color: theme.colors.error, marginLeft: 4, marginTop: 6 }}>
          {errors.description.message}
        </Text>
      ) : null}
      {errors?.unitPriceCents ? (
        <Text variant="bodySmall" style={{ color: theme.colors.error, marginLeft: 4, marginTop: 6 }}>
          {errors.unitPriceCents.message}
        </Text>
      ) : null}
    </View>
  );
}
