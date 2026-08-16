import { useState, type ComponentProps } from "react";
import { TextInput } from "react-native-paper";

type Props = Omit<ComponentProps<typeof TextInput>, "secureTextEntry" | "mode" | "right"> & {
  accessibilityLabel: string;
};

/**
 * Password field, now Paper's <TextInput> with a built-in <TextInput.Icon>
 * show/hide toggle instead of a hand-rolled Eye/EyeOff Pressable. Every
 * call site renders this inside a Card/CardRow that already supplies the
 * border and background (see e.g. app/auth/index.tsx), so this stays in
 * Paper's "flat" mode with the underline switched off at rest — a bare
 * input, not a second nested outline. `activeUnderlineColor` is left unset
 * on purpose (not "transparent" like `underlineColor`): Paper reuses that
 * same color for the text cursor, so forcing it transparent made the caret
 * invisible while typing. Unset falls through to the theme's teal primary,
 * so focus still shows a real underline + a visible cursor.
 */
export function PasswordInput({ accessibilityLabel, className, style, ...props }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <TextInput
      {...props}
      mode="flat"
      underlineColor="transparent"
      secureTextEntry={!visible}
      accessibilityLabel={accessibilityLabel}
      className={className}
      style={[{ flex: 1, backgroundColor: "transparent" }, style]}
      contentStyle={{ paddingHorizontal: 0 }}
      right={
        <TextInput.Icon
          icon={visible ? "eye-off" : "eye"}
          onPress={() => setVisible((v) => !v)}
          forceTextInputFocus={false}
          accessibilityLabel={visible ? "Wachtwoord verbergen" : "Wachtwoord tonen"}
        />
      }
    />
  );
}
