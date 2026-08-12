import { useState } from "react";
import { Pressable, TextInput, View, type TextInputProps } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

type Props = Omit<TextInputProps, "secureTextEntry"> & {
  accessibilityLabel: string;
};

/** Password field with a Lucide show/hide toggle — masked by default. */
export function PasswordInput({ accessibilityLabel, className, ...props }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View className="flex-1 flex-row items-center">
      <TextInput
        {...props}
        secureTextEntry={!visible}
        accessibilityLabel={accessibilityLabel}
        className={`flex-1 text-[15px] text-ink ${className ?? ""}`}
      />
      <Pressable
        onPress={() => setVisible((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={visible ? "Wachtwoord verbergen" : "Wachtwoord tonen"}
        hitSlop={8}
        className="h-11 w-11 items-center justify-center"
      >
        {visible ? <EyeOff color="#6b6b70" size={18} /> : <Eye color="#6b6b70" size={18} />}
      </Pressable>
    </View>
  );
}
