import { useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight } from "lucide-react-native";

import { Card, CardRow } from "@/components/ui/Card";
import { SendButton, type SendButtonState } from "@/components/ui/SendButton";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { useInvoiceStore } from "@/features/invoices/InvoiceStore";
import { CustomerPickerSheet } from "@/features/invoices/CustomerPickerSheet";
import { VatRatePicker } from "@/features/invoices/VatRatePicker";
import { invoiceFormSchema, type InvoiceFormValues } from "@/features/invoices/schema";
import { MOCK_CUSTOMERS } from "@/features/invoices/mock-data";
import type { Customer, Invoice } from "@/features/invoices/types";
import { calculateTotalCents } from "@/lib/vat";
import { formatEuroCents, parseEuroInputToCents } from "@/lib/currency";

type SendOutcome = "idle" | "success" | "failed";

export default function InvoiceCreateScreen() {
  const router = useRouter();
  const { addInvoice } = useInvoiceStore();
  const openedAt = useRef(Date.now());

  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [sendOutcome, setSendOutcome] = useState<SendOutcome>("idle");
  const [sentInvoice, setSentInvoice] = useState<Invoice | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: { customerId: "", description: "", quantity: 1, unitPriceCents: 0, vatRate: 21 },
    mode: "onBlur",
  });

  const quantity = watch("quantity") || 1;
  const vatRate = watch("vatRate");
  const unitPriceCents = watch("unitPriceCents") || 0;

  const totals = useMemo(
    () => calculateTotalCents(unitPriceCents, quantity, vatRate),
    [unitPriceCents, quantity, vatRate],
  );

  const buttonState: SendButtonState = isSubmitting ? "sending" : "idle";
  const canSend = Boolean(selectedCustomer) && unitPriceCents > 0;

  function resetToNewInvoice() {
    reset({ customerId: "", description: "", quantity: 1, unitPriceCents: 0, vatRate: 21 });
    setSelectedCustomer(null);
    setPriceInput("");
    setSendOutcome("idle");
    setSentInvoice(null);
    setElapsedSeconds(0);
    openedAt.current = Date.now();
  }

  function selectCustomer(customer: Customer) {
    setSelectedCustomer(customer);
    setValue("customerId", customer.id, { shouldValidate: true });
    setPickerVisible(false);
  }

  async function onSubmit(values: InvoiceFormValues) {
    setSendOutcome("idle");

    // Mock send — no backend wired yet (T3, /plan-eng-review). Typing "fail"
    // in the description simulates a failed send so the failure UI (Pass 2,
    // Issue 2) is reachable without a real network layer.
    await new Promise((resolve) => setTimeout(resolve, 900));

    if (values.description.toLowerCase().includes("fail")) {
      setSendOutcome("failed");
      return;
    }

    const seconds = Math.round((Date.now() - openedAt.current) / 1000);
    const invoice: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: `2026-${String(Math.floor(Math.random() * 900) + 100)}`,
      customer: selectedCustomer as Customer,
      description: values.description,
      quantity: values.quantity,
      unitPriceCents: values.unitPriceCents,
      vatRate: values.vatRate,
      totalCents: totals.totalCents,
      status: "sent",
      sentAt: new Date().toISOString(),
    };
    addInvoice(invoice);
    setSentInvoice(invoice);
    setElapsedSeconds(seconds);
    setSendOutcome("success");
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
      {sendOutcome === "failed" ? <StatusBanner kind="failed" onRetry={handleSubmit(onSubmit)} /> : null}

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

        <Text className="mb-2 ml-1 mt-5 text-[12px] font-semibold uppercase tracking-wide text-muted">
          Omschrijving
        </Text>
        <Card>
          <CardRow>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <TextInput
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Bijv. Stucwerk woonkamer"
                  placeholderTextColor="#b8b8bc"
                  className="flex-1 text-[15px] text-ink"
                  accessibilityLabel="Omschrijving van de klus"
                />
              )}
            />
          </CardRow>
          <CardRow>
            <Text className="text-[15px] text-ink">Aantal</Text>
            <Controller
              control={control}
              name="quantity"
              render={({ field }) => (
                <TextInput
                  value={String(field.value ?? 1)}
                  onChangeText={(t) => field.onChange(Number(t.replace(/[^0-9]/g, "")) || 1)}
                  keyboardType="number-pad"
                  className="w-16 text-right text-[15px] text-ink"
                  accessibilityLabel="Aantal"
                />
              )}
            />
          </CardRow>
          <CardRow>
            <Text className="text-[15px] text-ink">Prijs</Text>
            <Controller
              control={control}
              name="unitPriceCents"
              render={({ field }) => (
                <TextInput
                  value={priceInput}
                  onChangeText={(t) => {
                    setPriceInput(t);
                    field.onChange(parseEuroInputToCents(t) ?? 0);
                  }}
                  placeholder="0,00"
                  placeholderTextColor="#b8b8bc"
                  keyboardType="decimal-pad"
                  className="w-24 text-right text-[15px] text-ink"
                  accessibilityLabel="Prijs per stuk in euro"
                />
              )}
            />
          </CardRow>
          <CardRow isLast>
            <Text className="text-[15px] text-ink">BTW</Text>
            <View className="w-40">
              <Controller
                control={control}
                name="vatRate"
                render={({ field }) => <VatRatePicker value={field.value} onChange={field.onChange} />}
              />
            </View>
          </CardRow>
        </Card>
        {errors.description ? (
          <Text className="ml-1 mt-1.5 text-[12px] text-warn">{errors.description.message}</Text>
        ) : null}
        {errors.unitPriceCents ? (
          <Text className="ml-1 mt-1.5 text-[12px] text-warn">{errors.unitPriceCents.message}</Text>
        ) : null}

        <Card className="mt-5 px-4 py-4">
          <Text className="text-[13px] text-muted">Totaal (incl. BTW)</Text>
          <Text className="mt-1 text-[30px] font-bold tracking-tight text-ink">
            {formatEuroCents(totals.totalCents)}
          </Text>
          <Text className="mt-1 text-[12px] text-muted">
            {formatEuroCents(totals.subtotalCents)} + {formatEuroCents(totals.vatCents)} BTW ({vatRate}%)
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
          onPress={handleSubmit(onSubmit)}
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
