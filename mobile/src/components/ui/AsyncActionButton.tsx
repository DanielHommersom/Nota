import { Button, useTheme } from "react-native-paper";
import { Check } from "lucide-react-native";

export type AsyncButtonState = "idle" | "disabled" | "sending" | "success";

type Props = {
  state: AsyncButtonState;
  label: string;
  onPress: () => void;
  /**
   * Full sentence read by VoiceOver/TalkBack, e.g.
   * "Verstuur factuur van €544,50 aan Melvin de Boer".
   * Locked in /plan-design-review Pass 6 (accessibility baseline).
   */
  accessibilityLabel: string;
  /** Shown during `sending`. Defaults to the invoice-send flow's original copy. */
  sendingLabel?: string;
  /** Shown during `success`. Defaults to the invoice-send flow's original copy. */
  successLabel?: string;
};

/**
 * Shared primary-action button for any async submit (invoice send, account
 * creation, ...) — not invoice-specific despite the name's origin. Now
 * Paper's <Button mode="contained">: its built-in `loading` prop already
 * morphs the button into a spinner in place (Pass 3, Issue 4's "collapses
 * in-place, not an instant screen swap" requirement), so the hand-rolled
 * reanimated cross-fade this used to do is gone — Paper's own transition
 * covers it, and not re-adding a second animation layer on top of the
 * library's is the point of adopting it.
 */
export function AsyncActionButton({
  state,
  label,
  onPress,
  accessibilityLabel,
  sendingLabel = "Bezig met verzenden…",
  successLabel = "Verstuurd",
}: Props) {
  const theme = useTheme();
  const isDisabled = state === "disabled" || state === "sending";

  return (
    <Button
      mode="contained"
      onPress={onPress}
      disabled={isDisabled}
      loading={state === "sending"}
      icon={state === "success" ? ({ size, color }) => <Check color={color} size={size} strokeWidth={2.5} /> : undefined}
      buttonColor={state === "success" ? theme.colors.tertiary : undefined}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled, busy: state === "sending" }}
      // 56px content height clears the 44px minimum touch target (Pass 6, Issue 8).
      contentStyle={{ height: 56 }}
      style={{ borderRadius: 14, justifyContent: "center" }}
      labelStyle={{ fontSize: 17, fontWeight: "600" }}
    >
      {state === "sending" ? sendingLabel : state === "success" ? successLabel : label}
    </Button>
  );
}
