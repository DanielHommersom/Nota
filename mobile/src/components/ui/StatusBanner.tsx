import { Pressable, Text, View } from "react-native";
import { AlertTriangle, WifiOff } from "lucide-react-native";

type Props =
  | { kind: "offline-retrying" }
  | { kind: "failed"; onRetry: () => void };

/**
 * Two visually distinct states per /plan-design-review Pass 2 (Issue 2):
 * "offline-retrying" implies the system is auto-handling it; "failed" means
 * the system gave up and the user must act. Conflating them risks the user
 * waiting indefinitely on a send that already failed.
 */
export function StatusBanner(props: Props) {
  if (props.kind === "offline-retrying") {
    return (
      <View className="mx-4 mb-3 flex-row items-center gap-2 rounded-control bg-ink/90 px-3.5 py-3">
        <WifiOff color="#ffffff" size={16} />
        <Text className="flex-1 text-[13px] text-white">
          Geen verbinding — wordt verzonden zodra je weer online bent
        </Text>
      </View>
    );
  }

  return (
    <View className="mx-4 mb-3 rounded-control bg-warn-soft px-3.5 py-3">
      <View className="flex-row items-center gap-2">
        <AlertTriangle color="#b45309" size={16} />
        <Text className="flex-1 text-[13px] font-medium text-warn">
          Verzenden mislukt — controleer je internetverbinding
        </Text>
      </View>
      <Pressable
        onPress={props.onRetry}
        accessibilityRole="button"
        accessibilityLabel="Probeer opnieuw te verzenden"
        className="mt-2 h-9 items-center justify-center rounded-control bg-white/60 px-3"
      >
        <Text className="text-[13px] font-semibold text-warn">Opnieuw proberen</Text>
      </Pressable>
    </View>
  );
}
