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
 *
 * `dense` + a `min-h-11` (44px) floor — same fix as the bareInputProps
 * fields (see CustomerForm.tsx): Paper's non-dense default is a fixed
 * 56dp, which read as oversized. This keeps the password field the same
 * height as every other bare field in the app instead of standing out as
 * taller. Both the floor and `flex-1` (this field always fills its row —
 * see e.g. app/auth/index.tsx's Card/CardRow) are appended to `className`
 * rather than `style`, because any raw numeric value (`minHeight`, `flex`,
 * ...) mixed into `style` alongside a `className` on the same element trips
 * NativeWind's web style compiler ("styleq: <prop> typeof <n> is not
 * "string" or "null""). `style` is left available for callers to pass
 * string-valued overrides only (e.g. `backgroundColor`).
 */
export function PasswordInput({ accessibilityLabel, className, style, ...props }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <TextInput
      {...props}
      mode="flat"
      dense
      underlineColor="transparent"
      secureTextEntry={!visible}
      accessibilityLabel={accessibilityLabel}
      className={["flex-1", "min-h-11", className].filter(Boolean).join(" ")}
      style={[{ backgroundColor: "transparent" }, style]}
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
