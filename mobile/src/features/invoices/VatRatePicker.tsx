import { Pressable, Text, View } from "react-native";
import { VAT_RATES, type VatRate } from "@/lib/vat";

export function VatRatePicker({ value, onChange }: { value: VatRate; onChange: (rate: VatRate) => void }) {
  return (
    <View className="flex-row gap-2">
      {VAT_RATES.map((rate) => {
        const selected = rate === value;
        return (
          <Pressable
            key={rate}
            onPress={() => onChange(rate)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${rate} procent btw`}
            className={`h-9 flex-1 items-center justify-center rounded-control ${
              selected ? "bg-accent" : "bg-bg border border-border"
            }`}
          >
            <Text className={`text-[14px] font-medium ${selected ? "text-white" : "text-ink"}`}>{rate}%</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
