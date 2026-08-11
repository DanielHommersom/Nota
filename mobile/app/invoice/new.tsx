import { useCallback, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Plus } from "lucide-react-native";

import { Card, CardRow } from "@/components/ui/Card";
import { SendButton, type SendButtonState } from "@/components/ui/SendButton";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { useInvoiceStore } from "@/features/invoices/InvoiceStore";
import { CustomerPickerSheet } from "@/features/invoices/CustomerPickerSheet";
import { InvoiceItemCard } from "@/features/invoices/InvoiceItemCard";
import { invoiceFormSchema, type InvoiceFormValues } from "@/features/invoices/schema";
import { MOCK_CUSTOMERS } from "@/features/invoices/mock-data";
import type { Customer, Invoice, InvoiceItem } from "@/features/invoices/types";
import { calculateInvoiceTotals, DEFAULT_VAT_RATE } from "@/lib/vat";
import { formatEuroCents } from "@/lib/currency";

type SendOutcome = "idle" | "success" | "failed";

const BLANK_ITEM = { description: "", quantity: 1, unitPriceCents: 0, vatRate: DEFAULT_VAT_RATE } as const;

export default function InvoiceCreateScreen() {
  const router = useRouter();
  const { addInvoice } = useInvoiceStore();
  // Lazy useState initializer, not useRef(Date.now()) — React's sanctioned
  // pattern for a one-time impure value computed at mount. useRef's
  // initializer runs on every render pass as far as the purity analyzer is
  // concerned; useState's lazy-init callback is documented as safe.
  const [openedAt, setOpenedAt] = useState(() => Date.now());

  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  // Keyed by react-hook-form's field-array id, so per-row Dutch-formatted
  // price text survives independently of the numeric cents value.
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
  const [sendOutcome, setSendOutcome] = useState<SendOutcome>("idle");
  const [sentInvoice, setSentInvoice] = useState<Invoice | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: { customerId: "", items: [{ ...BLANK_ITEM }] },
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  // useWatch (not the imperative watch() call) is the reactive-subscription
  // form RHF recommends for nested/array field values — watch() combined
  // with useMemo silently went stale here (ESLint's "cannot be memoized
  // safely" warning on watch() was pointing at exactly this class of bug).
  const items = useWatch({ control, name: "items" });

  const totals = calculateInvoiceTotals(items ?? []);
  const vatBreakdown = Object.entries(totals.vatByRate) as [string, number][];

  const buttonState: SendButtonState = isSubmitting ? "sending" : "idle";
  const canSend = Boolean(selectedCustomer) && totals.subtotalCents > 0;

  function resetToNewInvoice() {
    reset({ customerId: "", items: [{ ...BLANK_ITEM }] });
    setSelectedCustomer(null);
    setPriceInputs({});
    setSendOutcome("idle");
    setSentInvoice(null);
    setElapsedSeconds(0);
    setOpenedAt(Date.now());
  }

  function selectCustomer(customer: Customer) {
    setSelectedCustomer(customer);
    setValue("customerId", customer.id, { shouldValidate: true });
    setPickerVisible(false);
  }

  function addLine() {
    append({ ...BLANK_ITEM });
  }

  // useCallback (not a plain nested function declaration) is what the
  // purity analyzer recognizes as a genuine event-handler boundary — a
  // plain-function version of this got Date.now()/Math.random() flagged as
  // "might execute during render" even though it only ever runs on submit.
  // Takes `customer` as a parameter (rather than closing over the
  // `selectedCustomer` state object) and recomputes totals from the
  // submitted values (rather than closing over the outer `totals`) so the
  // dependency array only needs stable, primitive-ish values — closing
  // over reference-typed state tripped the compiler's manual-memoization
  // preservation check.
  const onSubmit = useCallback(
    async (values: InvoiceFormValues, customer: Customer) => {
      setSendOutcome("idle");

      // Mock send — no backend wired yet (T3, /plan-eng-review). Typing
      // "fail" in any line's description simulates a failed send so the
      // failure UI (Pass 2, Issue 2) is reachable without a real network layer.
      await new Promise((resolve) => setTimeout(resolve, 900));

      if (values.items.some((item) => item.description.toLowerCase().includes("fail"))) {
        setSendOutcome("failed");
        return;
      }

      const seconds = Math.round((Date.now() - openedAt) / 1000);
      const submittedTotals = calculateInvoiceTotals(values.items);
      const invoiceItems: InvoiceItem[] = values.items.map((item, index) => ({
        id: `item_${Date.now()}_${index}`,
        description: item.description,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        vatRate: item.vatRate,
      }));
      const invoice: Invoice = {
        id: `inv_${Date.now()}`,
        invoiceNumber: `2026-${String(Math.floor(Math.random() * 900) + 100)}`,
        customer,
        items: invoiceItems,
        totalCents: submittedTotals.totalCents,
        status: "sent",
        sentAt: new Date().toISOString(),
      };
      addInvoice(invoice);
      setSentInvoice(invoice);
      setElapsedSeconds(seconds);
      setSendOutcome("success");
    },
    [openedAt, addInvoice],
  );

  // Wrapping handleSubmit(...) inside a plain function — rather than
  // calling it inline in JSX (onPress={handleSubmit(onSubmit)}) — matters:
  // the inline form invokes handleSubmit during render, and the purity
  // analyzer can't prove handleSubmit won't call its argument synchronously,
  // so it flags everything reachable from it as "might execute during
  // render". Deferring the call into a function only invoked on press
  // resolves it for real, not just for the linter.
  function submitInvoice() {
    if (!selectedCustomer) return;
    const customer = selectedCustomer;
    void handleSubmit((values) => onSubmit(values, customer))();
  }

  if (sendOutcome === "success" && sentInvoice) {
    return (
      <View className="flex-1 items-center bg-bg px-6 pt-10">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-success-soft">
          <Text className="text-[28px]">✓</Text>
        </View>
        <Text className="mt-3 text-[19px] font-bold text-ink">Verstuurd!</Text>
        <Text className="mt-1 text-center text-[14px] text-muted">
          {sentInvoice.customer.name} heeft de factuur ontvangen
        </Text>

        <Card className="mt-6 w-full">
          <CardRow>
            <Text className="text-[15px] text-ink">Bedrag</Text>
            <Text className="text-[15px] font-medium text-ink">{formatEuroCents(sentInvoice.totalCents)}</Text>
          </CardRow>
          <CardRow>
            <Text className="text-[15px] text-ink">Status</Text>
            <Text className="text-[15px] font-medium text-success">Verstuurd</Text>
          </CardRow>
          <CardRow isLast>
            <Text className="text-[15px] text-ink">Duur</Text>
            <Text className="text-[15px] font-medium text-ink">{elapsedSeconds} seconden</Text>
          </CardRow>
        </Card>

        <View className="mt-auto w-full pb-6">
          <SendButton
            state="idle"
            label="+ Nieuwe factuur"
            accessibilityLabel="Nieuwe factuur starten"
            onPress={resetToNewInvoice}
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-bg" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {sendOutcome === "failed" ? <StatusBanner kind="failed" onRetry={submitInvoice} /> : null}

      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <Text className="mb-2 ml-1 text-[12px] font-semibold uppercase tracking-wide text-muted">Klant</Text>
        <Card>
          <CardRow isLast>
            <CustomerFieldRow
              onPress={() => setPickerVisible(true)}
              label={selectedCustomer?.name ?? "Kies een klant"}
              muted={!selectedCustomer}
            />
          </CardRow>
        </Card>
        {errors.customerId ? (
          <Text className="ml-1 mt-1.5 text-[12px] text-warn">{errors.customerId.message}</Text>
        ) : null}

        <View className="mt-5">
          {fields.map((field, index) => (
            <InvoiceItemCard
              key={field.id}
              control={control}
              index={index}
              errors={errors.items?.[index]}
              canRemove={fields.length > 1}
              onRemove={() => remove(index)}
              priceInput={priceInputs[field.id] ?? ""}
              onPriceInputChange={(text) => setPriceInputs((prev) => ({ ...prev, [field.id]: text }))}
              label={fields.length > 1 ? `Regel ${index + 1}` : "Omschrijving"}
            />
          ))}
          {errors.items?.root?.message ? (
            <Text className="ml-1 mt-1 text-[12px] text-warn">{errors.items.root.message}</Text>
          ) : null}

          <Pressable
            onPress={addLine}
            accessibilityRole="button"
            accessibilityLabel="Regel toevoegen"
            className="mt-1 min-h-11 flex-row items-center justify-center gap-1.5 rounded-control border border-dashed border-border py-3"
          >
            <Plus color="#2563eb" size={16} />
            <Text className="text-[14px] font-medium text-accent">Regel toevoegen</Text>
          </Pressable>
        </View>

        <Card className="mt-5 px-4 py-4">
          <Text className="text-[13px] text-muted">Totaal (incl. BTW)</Text>
          <Text className="mt-1 text-[30px] font-bold tracking-tight text-ink">
            {formatEuroCents(totals.totalCents)}
          </Text>
          <Text className="mt-1 text-[12px] text-muted">
            {formatEuroCents(totals.subtotalCents)}
            {vatBreakdown.length > 0
              ? " + " + vatBreakdown.map(([rate, cents]) => `${formatEuroCents(cents)} BTW (${rate}%)`).join(" + ")
              : ""}
          </Text>
        </Card>
      </ScrollView>

      <View className="px-4 pb-6 pt-2">
        <SendButton
          state={!canSend ? "disabled" : buttonState}
          label="Verstuur"
          accessibilityLabel={`Verstuur factuur van ${formatEuroCents(totals.totalCents)}${
            selectedCustomer ? ` aan ${selectedCustomer.name}` : ""
          }`}
          onPress={submitInvoice}
        />
        <Text className="mt-2.5 text-center text-[12px] text-muted">
          {selectedCustomer ? `${selectedCustomer.name} ontvangt de factuur per e-mail` : "Kies eerst een klant"}
        </Text>
      </View>

      <CustomerPickerSheet
        visible={pickerVisible}
        customers={MOCK_CUSTOMERS}
        onSelect={selectCustomer}
        onCreateNew={() => {
          setPickerVisible(false);
          router.push("/customer/new");
        }}
        onClose={() => setPickerVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

function CustomerFieldRow({ onPress, label, muted }: { onPress: () => void; label: string; muted?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="min-h-11 flex-1 flex-row items-center justify-between"
    >
      <Text className={`flex-1 text-[15px] ${muted ? "text-muted" : "font-medium text-ink"}`}>{label}</Text>
      <ChevronRight color="#c4c4c8" size={16} />
    </Pressable>
  );
}
