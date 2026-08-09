import { View, type ViewProps } from "react-native";

/**
 * Base surface for grouped content. Radius/border/shadow match the
 * accent-blue, calm, rounded-card visual language locked in
 * /plan-design-review (Nota design doc, Design Decisions section).
 */
export function Card({ className, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={`rounded-card border border-border bg-card ${className ?? ""}`}
      style={{ shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } }}
      {...props}
    />
  );
}

export function CardRow({
  children,
  isLast = false,
  className,
}: {
  children: React.ReactNode;
  isLast?: boolean;
  className?: string;
}) {
  return (
    <View
      className={`flex-row items-center justify-between px-4 py-3.5 ${
        isLast ? "" : "border-b border-border"
      } ${className ?? ""}`}
    >
      {children}
    </View>
  );
}
