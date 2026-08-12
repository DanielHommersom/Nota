import { useEffect } from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
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
 * creation, ...) — not invoice-specific despite the name's origin. Per
 * /plan-design-review Pass 3 (Issue 4): the button collapses in-place into a
 * spinner on tap, then morphs into a checkmark on success, rather than an
 * instant screen swap. Reused as-is (same animation language) rather than
 * forked, per the onboarding flow spec.
 */
export function AsyncActionButton({
  state,
  label,
  onPress,
  accessibilityLabel,
  sendingLabel = "Bezig met verzenden…",
  successLabel = "Verstuurd",
}: Props) {
  const contentOpacity = useSharedValue(1);

  useEffect(() => {
    contentOpacity.value = withTiming(1, { duration: 150 });
  }, [state, contentOpacity]);

  const style = useAnimatedStyle(() => ({ opacity: contentOpacity.value }));

  const isDisabled = state === "disabled" || state === "sending";
  const bg =
    state === "disabled"
      ? "bg-border"
      : state === "success"
        ? "bg-success"
        : "bg-accent";

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled, busy: state === "sending" }}
      // 56px height clears the 44px minimum touch target (Pass 6, Issue 8).
      className={`h-14 items-center justify-center rounded-control ${bg}`}
    >
      <Animated.View style={style} className="flex-row items-center gap-2">
        {state === "sending" ? (
          <ActivityIndicator color="#ffffff" />
        ) : state === "success" ? (
          <Check color="#ffffff" size={20} strokeWidth={2.5} />
        ) : null}
        <Text
          className={`text-[17px] font-semibold ${
            state === "disabled" ? "text-muted" : "text-white"
          }`}
        >
          {state === "sending" ? sendingLabel : state === "success" ? successLabel : label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
