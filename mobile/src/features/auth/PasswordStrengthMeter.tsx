import { Text, View } from "react-native";
import { calculatePasswordStrength } from "./passwordStrength";

const LABEL: Record<"weak" | "medium" | "strong", string> = {
  weak: "Zwak",
  medium: "Redelijk",
  strong: "Sterk",
};
const BAR_COLOR: Record<"weak" | "medium" | "strong", string> = {
  weak: "bg-warn",
  medium: "bg-accent",
  strong: "bg-success",
};
const TEXT_COLOR: Record<"weak" | "medium" | "strong", string> = {
  weak: "text-warn",
  medium: "text-accent",
  strong: "text-success",
};

/** Live feedback while typing — signup only, a returning user's existing password isn't "weak" to relitigate at login. */
export function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = calculatePasswordStrength(password);
  if (strength === "empty") return null;

  const filledBars = strength === "weak" ? 1 : strength === "medium" ? 2 : 3;

  return (
    <View
      className="mt-1.5 flex-row items-center gap-2"
      accessibilityLabel={`Wachtwoordsterkte: ${LABEL[strength]}`}
    >
      <View className="flex-1 flex-row gap-1">
        {[0, 1, 2].map((i) => (
          <View key={i} className={`h-1 flex-1 rounded-full ${i < filledBars ? BAR_COLOR[strength] : "bg-border"}`} />
        ))}
      </View>
      <Text className={`text-[12px] font-medium ${TEXT_COLOR[strength]}`}>{LABEL[strength]}</Text>
    </View>
  );
}
