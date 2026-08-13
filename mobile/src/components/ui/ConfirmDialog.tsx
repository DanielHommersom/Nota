import { Modal, Pressable, Text, View } from "react-native";

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** Warm/warn styling on the confirm button for destructive actions (e.g. log out). */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Centered confirmation modal — used instead of the native Alert API to
 * stay consistent with the app's own rounded-card visual language (same
 * reasoning as CustomerPickerSheet using a custom sheet, not a native
 * picker). Reusable for any "are you sure?" moment, not just logout.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = "Annuleren",
  destructive = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable
        className="flex-1 items-center justify-center bg-black/40 px-6"
        onPress={onCancel}
        accessibilityLabel={cancelLabel}
      >
        {/* A no-op onPress on the card itself claims the touch responder so
            taps inside the dialog don't fall through to the backdrop's
            dismiss handler above. */}
        <Pressable onPress={() => {}} className="w-full max-w-sm rounded-card bg-card p-5">
          <Text className="text-[17px] font-semibold text-ink">{title}</Text>
          <Text className="mt-1.5 text-[14px] leading-5 text-muted">{message}</Text>

          <View className="mt-5 flex-row gap-3">
            <Pressable
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
              className="min-h-11 flex-1 items-center justify-center rounded-control bg-bg"
            >
              <Text className="text-[15px] font-medium text-ink">{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              className={`min-h-11 flex-1 items-center justify-center rounded-control ${destructive ? "bg-warn" : "bg-accent"}`}
            >
              <Text className="text-[15px] font-semibold text-white">{confirmLabel}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
