import { Pressable, Text, TextInput, View } from "react-native";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { Trash2 } from "lucide-react-native";
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
  priceInput: string;
  onPriceInputChange: (text: string) => void;
  label: string;
};

/** One editable line item — repeated per row in the invoice create form's field array. */
export function InvoiceItemCard({
  control,
  index,
  errors,
  canRemove,
  onRemove,
  priceInput,
  onPriceInputChange,
  label,
}: Props) {
  return (
    <View className="mb-3">
      <View className="mb-2 ml-1 flex-row items-center justify-between">
        <Text className="text-[12px] font-semibold uppercase tracking-wide text-muted">{label}</Text>
        {canRemove ? (
          <Pressable
            onPress={onRemove}
            accessibilityRole="button"
            accessibilityLabel={`Regel ${index + 1} verwijderen`}
            hitSlop={8}
            className="h-8 w-8 items-center justify-center rounded-full"
          >
            <Trash2 color="#b45309" size={16} />
          </Pressable>
        ) : null}
      </View>

      <Card>
        <CardRow>
          <Controller
            control={control}
            name={`items.${index}.description`}
            render={({ field }) => (
              <TextInput
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                placeholder="Bijv. Stucwerk woonkamer"
                placeholderTextColor="#b8b8bc"
                className="flex-1 text-[15px] text-ink"
                accessibilityLabel={`Omschrijving van regel ${index + 1}`}
              />
            )}
          />
        </CardRow>
        <CardRow>
          <Text className="text-[15px] text-ink">Aantal</Text>
          <Controller
            control={control}
            name={`items.${index}.quantity`}
            render={({ field }) => (
              <TextInput
                value={String(field.value ?? 1)}
                onChangeText={(t) => field.onChange(Number(t.replace(/[^0-9]/g, "")) || 1)}
                keyboardType="number-pad"
                className="w-16 text-right text-[15px] text-ink"
                accessibilityLabel={`Aantal voor regel ${index + 1}`}
              />
            )}
          />
        </CardRow>
        <CardRow>
          <Text className="text-[15px] text-ink">Prijs</Text>
          <Controller
            control={control}
            name={`items.${index}.unitPriceCents`}
            render={({ field }) => (
              <TextInput
                value={priceInput}
                onChangeText={(t) => {
                  onPriceInputChange(t);
                  field.onChange(parseEuroInputToCents(t) ?? 0);
                }}
                placeholder="0,00"
                placeholderTextColor="#b8b8bc"
                keyboardType="decimal-pad"
                className="w-24 text-right text-[15px] text-ink"
                accessibilityLabel={`Prijs per stuk voor regel ${index + 1}`}
              />
            )}
          />
        </CardRow>
        <CardRow isLast>
          <Text className="text-[15px] text-ink">BTW</Text>
          <View className="w-40">
            <Controller
              control={control}
              name={`items.${index}.vatRate`}
              render={({ field }) => <VatRatePicker value={field.value} onChange={field.onChange} />}
            />
          </View>
        </CardRow>
      </Card>
      {errors?.description ? (
        <Text className="ml-1 mt-1.5 text-[12px] text-warn">{errors.description.message}</Text>
      ) : null}
      {errors?.unitPriceCents ? (
        <Text className="ml-1 mt-1.5 text-[12px] text-warn">{errors.unitPriceCents.message}</Text>
      ) : null}
    </View>
  );
}
