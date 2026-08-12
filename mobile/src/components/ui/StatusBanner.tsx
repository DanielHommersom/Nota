import { Pressable, Text, View } from "react-native";
import { AlertTriangle, WifiOff } from "lucide-react-native";

type Props = {
  kind: "offline-retrying" | "failed";
  /** Defaults preserve the original invoice-send copy for existing call sites. */
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  retryAccessibilityLabel?: string;
  /**
   * Defaults to "mx-4 mb-3" (the invoice screens' unpadded container). A
   * screen with its own horizontal padding (e.g. auth) should pass "mb-3"
   * or similar to avoid double-margining — NativeWind can't reliably
   * override mx-4 via a second className, so this replaces it outright.
   */
  containerClassName?: string;
};

const DEFAULT_MESSAGE: Record<Props["kind"], string> = {
  "offline-retrying": "Geen verbinding — wordt verzonden zodra je weer online bent",
  failed: "Verzenden mislukt — controleer je internetverbinding",
};

/**
 * Two visually distinct states per /plan-design-review Pass 2 (Issue 2):
 * "offline-retrying" implies the system is auto-handling it (dark, no
 * required action); "failed" means the system gave up and the user must
 * act (warm, an action). Conflating them risks the user waiting
 * indefinitely on something that already failed. Shared across any async
 * submit flow (invoice send, account creation, ...) via the message/
 * onRetry overrides — the visual distinction itself never changes.
 */
export function StatusBanner({
  kind,
  message,
  onRetry,
  retryLabel = "Opnieuw proberen",
  retryAccessibilityLabel,
  containerClassName = "mx-4 mb-3",
}: Props) {
  const text = message ?? DEFAULT_MESSAGE[kind];

  if (kind === "offline-retrying") {
    return (
      <View className={`rounded-control bg-ink/90 px-3.5 py-3 ${containerClassName}`}>
        <View className="flex-row items-center gap-2">
          <WifiOff color="#ffffff" size={16} />
          <Text className="flex-1 text-[13px] text-white">{text}</Text>
        </View>
        {onRetry ? (
          <Pressable
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel={retryAccessibilityLabel ?? retryLabel}
            className="mt-2 h-9 items-center justify-center rounded-control bg-white/15"
          >
            <Text className="text-[13px] font-semibold text-white">{retryLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <View className={`rounded-control bg-warn-soft px-3.5 py-3 ${containerClassName}`}>
      <View className="flex-row items-center gap-2">
        <AlertTriangle color="#b45309" size={16} />
        <Text className="flex-1 text-[13px] font-medium text-warn">{text}</Text>
      </View>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={retryAccessibilityLabel ?? retryLabel}
          className="mt-2 h-9 items-center justify-center rounded-control bg-white/60 px-3"
        >
          <Text className="text-[13px] font-semibold text-warn">{retryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
