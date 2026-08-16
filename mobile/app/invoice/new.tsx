import { useCallback, useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HeaderButton } from "expo-router/react-navigation";
import { Check, ChevronRight, Plus, Trash2, WifiOff } from "lucide-react-native";
import { Button, List, Text, useTheme } from "react-native-paper";

import { Card, CardRow } from "@/components/ui/Card";
import { AsyncActionButton, type AsyncButtonState } from "@/components/ui/AsyncActionButton";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useInvoiceStore } from "@/features/invoices/InvoiceStore";
import { useCustomerStore } from "@/features/customers/CustomerStore";
import { CustomerPickerSheet } from "@/features/invoices/CustomerPickerSheet";
import { QuickAddCustomerSheet } from "@/features/customers/QuickAddCustomerSheet";
import { InvoiceItemCard } from "@/features/invoices/InvoiceItemCard";
import { invoiceFormSchema, type InvoiceFormValues } from "@/features/invoices/schema";
import { calculateDueDate } from "@/features/invoices/paymentTerms";
import type { Customer, Invoice, InvoiceItem } from "@/features/invoices/types";
import { calculateInvoiceTotals, DEFAULT_VAT_RATE } from "@/lib/vat";
import { formatEuroCents } from "@/lib/currency";
import { goOffline, isOnline } from "@/lib/networkSimulator";

type SendOutcome = "idle" | "success" | "failed" | "queued";

const BLANK_ITEM = { description: "", quantity: 1, unitPriceCents: 0, vatRate: DEFAULT_VAT_RATE } as const;

function formatPriceInput(cents: number): string {
  if (!cents) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}

export default function InvoiceCreateScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const { invoices, addInvoice, updateInvoice, deleteInvoice, getInvoice, allocateInvoiceNumber } = useInvoiceStore();
  const { customers, addCustomer } = useCustomerStore();

  // Editing an existing draft loads its saved values once at mount — this
  // screen doesn't currently re-sync if the underlying store record
  // changes out from under it mid-edit, which is fine for a single-user
  // mock store with no real-time collaboration to worry about yet.
  const [existingInvoice] = useState<Invoice | null>(() => (editId ? (getInvoice(editId) ?? null) : null));
  const isEditingDraft = Boolean(existingInvoice);

  const [openedAt, setOpenedAt] = useState(() => Date.now());
  const [pickerVisible, setPickerVisible] = useState(false);
  const [quickAddVisible, setQuickAddVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(existingInvoice?.customer ?? null);
  const [sendOutcome, setSendOutcome] = useState<SendOutcome>("idle");
  const [sentInvoice, setSentInvoice] = useState<Invoice | null>(null);
  const [wasQueued, setWasQueued] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [deleteDraftVisible, setDeleteDraftVisible] = useState(false);
  const [savedDraftPulse, setSavedDraftPulse] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      customerId: existingInvoice?.customer.id ?? "",
      items: existingInvoice?.items.length
        ? existingInvoice.items.map(({ description, quantity, unitPriceCents, vatRate }) => ({
            description,
            quantity,
            unitPriceCents,
            vatRate,
          }))
        : [{ ...BLANK_ITEM }],
    },
    mode: "onBlur",
  });

  const { fields, append, remove, move } = useFieldArray({ control, name: "items" });
  const items = useWatch({ control, name: "items" });

  // Lazy initializer (runs once, during the same render pass useFieldArray
  // assigns `fields` its ids) rather than an effect that sets state after
  // mount — same "derive during render, not in an Effect" preference the
  // rest of this app follows (see openedAt above, and the invoice-submit
  // comment on useState's lazy-init being the sanctioned one-time-impure-
  // value pattern).
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>(() => {
    if (!existingInvoice) return {};
    const seeded: Record<string, string> = {};
    fields.forEach((field, index) => {
      const cents = existingInvoice.items[index]?.unitPriceCents;
      if (cents) seeded[field.id] = formatPriceInput(cents);
    });
    return seeded;
  });

  const totals = calculateInvoiceTotals(items ?? []);
  const vatBreakdown = Object.entries(totals.vatByRate) as [string, number][];

  const buttonState: AsyncButtonState = isSubmitting ? "sending" : "idle";
  const canSend = Boolean(selectedCustomer) && totals.subtotalCents > 0;
  const canSaveDraft = Boolean(selectedCustomer);

  function resetToNewInvoice() {
    reset({ customerId: "", items: [{ ...BLANK_ITEM }] });
    setSelectedCustomer(null);
    setPriceInputs({});
    setSendOutcome("idle");
    setSentInvoice(null);
    setWasQueued(false);
    setElapsedSeconds(0);
    setOpenedAt(Date.now());
    router.setParams({ editId: undefined });
  }

  function selectCustomer(customer: Customer) {
    setSelectedCustomer(customer);
    setValue("customerId", customer.id, { shouldValidate: true });
    setPickerVisible(false);
  }

  function addLine() {
    append({ ...BLANK_ITEM });
  }

  function saveDraft() {
    if (!selectedCustomer) return;
    const values = getValues();
    const invoiceItems: InvoiceItem[] = values.items.map((item, index) => ({
      id: existingInvoice?.items[index]?.id ?? `item_${Date.now()}_${index}`,
      description: item.description || "",
      quantity: item.quantity || 1,
      unitPriceCents: item.unitPriceCents || 0,
      vatRate: item.vatRate ?? DEFAULT_VAT_RATE,
    }));
    const draftTotals = calculateInvoiceTotals(invoiceItems);

    if (existingInvoice) {
      updateInvoice(existingInvoice.id, {
        customer: selectedCustomer,
        items: invoiceItems,
        totalCents: draftTotals.totalCents,
        updatedAt: new Date().toISOString(),
      });
    } else {
      const draft: Invoice = {
        id: `inv_${Date.now()}`,
        invoiceNumber: null,
        customer: selectedCustomer,
        items: invoiceItems,
        totalCents: draftTotals.totalCents,
        status: "draft",
        sentAt: null,
        dueDate: null,
        paidAt: null,
        updatedAt: new Date().toISOString(),
      };
      addInvoice(draft);
    }
    setSavedDraftPulse(true);
    setTimeout(() => router.back(), 550);
  }

  function requestDeleteDraft() {
    setDeleteDraftVisible(true);
  }

  function confirmDeleteDraft() {
    setDeleteDraftVisible(false);
    if (existingInvoice) deleteInvoice(existingInvoice.id);
    router.back();
  }

  const onSubmit = useCallback(
    async (values: InvoiceFormValues, customer: Customer) => {
      setSendOutcome("idle");

      // Mock send — no backend wired yet (T3, /plan-eng-review). Same dev
      // test-hook convention used throughout this app: typing "fail" in a
      // line description simulates a failed send, typing "offline"
      // simulates no connectivity (distinct outcome — see
      // lib/networkSimulator.ts and InvoiceStore's queue processor).
      await new Promise((resolve) => setTimeout(resolve, 900));

      const descriptions = values.items.map((item) => item.description.toLowerCase());
      const triggersOffline = descriptions.some((d) => d.includes("offline"));
      const triggersFail = descriptions.some((d) => d.includes("fail"));

      if (triggersOffline && isOnline()) {
        goOffline();
      }

      const submittedTotals = calculateInvoiceTotals(values.items);
      const invoiceItems: InvoiceItem[] = values.items.map((item, index) => ({
        id: existingInvoice?.items[index]?.id ?? `item_${Date.now()}_${index}`,
        description: item.description,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        vatRate: item.vatRate,
      }));

      if (!isOnline()) {
        const queued: Invoice = {
          id: existingInvoice?.id ?? `inv_${Date.now()}`,
          invoiceNumber: null,
          customer,
          items: invoiceItems,
          totalCents: submittedTotals.totalCents,
          status: "queued",
          sentAt: null,
          dueDate: null,
          paidAt: null,
          updatedAt: new Date().toISOString(),
        };
        if (existingInvoice) updateInvoice(existingInvoice.id, queued);
        else addInvoice(queued);
        setSentInvoice(queued);
        setWasQueued(true);
        setSendOutcome("queued");
        return;
      }

      if (triggersFail) {
        setSendOutcome("failed");
        return;
      }

      const seconds = Math.round((Date.now() - openedAt) / 1000);
      const invoiceNumber = await allocateInvoiceNumber();
      const sentAt = new Date().toISOString();
      const invoice: Invoice = {
        id: existingInvoice?.id ?? `inv_${Date.now()}`,
        invoiceNumber,
        customer,
        items: invoiceItems,
        totalCents: submittedTotals.totalCents,
        status: "sent",
        sentAt,
        dueDate: calculateDueDate(sentAt),
        paidAt: null,
        updatedAt: new Date().toISOString(),
      };
      if (existingInvoice) updateInvoice(existingInvoice.id, invoice);
      else addInvoice(invoice);
      setSentInvoice(invoice);
      setElapsedSeconds(seconds);
      setSendOutcome("success");
    },
    [openedAt, addInvoice, updateInvoice, allocateInvoiceNumber, existingInvoice],
  );

  function submitInvoice() {
    if (!selectedCustomer) return;
    const customer = selectedCustomer;
    void handleSubmit((values) => onSubmit(values, customer))();
  }

  // Watches the store for the queued invoice above flipping to "sent" —
  // InvoiceStoreProvider's outbox processor does that automatically once
  // connectivity returns (real or simulated), with nobody needing to
  // reopen this screen or tap retry. See FRONTEND-CHECKLIST.md item 20.
  // This is a real "synchronize local UI with an external store" case, not
  // state that could be derived during render.
  useEffect(() => {
    if (sendOutcome !== "queued" || !sentInvoice) return;
    const latest = invoices.find((inv) => inv.id === sentInvoice.id);
    if (latest && latest.status === "sent") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mirrors external InvoiceStore state, not derived render state
      setSentInvoice(latest);
      setSendOutcome("success");
    }
  }, [invoices, sendOutcome, sentInvoice]);

  if ((sendOutcome === "success" || sendOutcome === "queued") && sentInvoice) {
    const isQueued = sendOutcome === "queued";
    return (
      <View className="flex-1 items-center bg-bg px-6 pt-10">
        <View className={`h-16 w-16 items-center justify-center rounded-full ${isQueued ? "bg-accent-soft" : "bg-success-soft"}`}>
          {isQueued ? <WifiOff color={theme.colors.primary} size={26} /> : <Check color={theme.colors.tertiary} size={28} strokeWidth={2.5} />}
        </View>
        <Text variant="titleLarge" style={{ marginTop: 12, fontWeight: "700", color: theme.colors.onSurface }}>
          {isQueued ? "In de wachtrij" : "Verstuurd!"}
        </Text>
        <Text variant="bodyMedium" style={{ marginTop: 4, textAlign: "center", color: theme.colors.onSurfaceVariant }}>
          {isQueued
            ? "Geen verbinding — deze factuur wordt automatisch verstuurd zodra je weer online bent."
            : wasQueued
              ? `${sentInvoice.customer.name} heeft de factuur ontvangen — verzonden zodra de verbinding terugkwam.`
              : `${sentInvoice.customer.name} heeft de factuur ontvangen`}
        </Text>

        <Card className="mt-6 w-full">
          <CardRow>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
              Bedrag
            </Text>
            <Text variant="bodyMedium" style={{ fontWeight: "500", color: theme.colors.onSurface }}>
              {formatEuroCents(sentInvoice.totalCents)}
            </Text>
          </CardRow>
          <CardRow isLast={isQueued}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
              Status
            </Text>
            <Text variant="bodyMedium" style={{ fontWeight: "500", color: isQueued ? theme.colors.primary : theme.colors.tertiary }}>
              {isQueued ? "In wachtrij" : "Verstuurd"}
            </Text>
          </CardRow>
          {!isQueued ? (
            <CardRow isLast={wasQueued}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                Factuurnummer
              </Text>
              <Text variant="bodyMedium" style={{ fontWeight: "500", color: theme.colors.onSurface }}>
                {sentInvoice.invoiceNumber}
              </Text>
            </CardRow>
          ) : null}
          {!isQueued && !wasQueued ? (
            <CardRow isLast>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                Duur
              </Text>
              <Text variant="bodyMedium" style={{ fontWeight: "500", color: theme.colors.onSurface }}>
                {elapsedSeconds} seconden
              </Text>
            </CardRow>
          ) : null}
        </Card>

        <View className="mt-auto w-full gap-3 pb-6">
          {!isQueued ? (
            <Button
              mode="contained-tonal"
              onPress={() => router.replace(`/invoice/${sentInvoice.id}`)}
              accessibilityLabel="Factuur bekijken"
              buttonColor={theme.colors.primaryContainer}
              textColor={theme.colors.primary}
              contentStyle={{ height: 48 }}
              style={{ borderRadius: 14 }}
            >
              Factuur bekijken
            </Button>
          ) : null}
          <AsyncActionButton
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
      <Stack.Screen
        options={{
          title: isEditingDraft ? "Concept bewerken" : "Nieuwe factuur",
          headerRight: isEditingDraft
            ? () => (
                <HeaderButton onPress={requestDeleteDraft} accessibilityLabel="Concept verwijderen">
                  <Trash2 color={theme.colors.error} size={20} />
                </HeaderButton>
              )
            : undefined,
        }}
      />

      {sendOutcome === "failed" ? <StatusBanner kind="failed" onRetry={submitInvoice} /> : null}

      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4, marginBottom: 8 }}>
          Klant
        </Text>
        <List.Item
          title={selectedCustomer?.name ?? "Kies een klant"}
          titleStyle={{ fontSize: 15, fontWeight: selectedCustomer ? "500" : "400", color: selectedCustomer ? theme.colors.onSurface : theme.colors.onSurfaceVariant }}
          onPress={() => setPickerVisible(true)}
          accessibilityLabel={selectedCustomer?.name ?? "Kies een klant"}
          right={() => <ChevronRight color={theme.colors.onSurfaceVariant} size={16} style={{ alignSelf: "center" }} />}
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: theme.colors.outline,
            paddingHorizontal: 16,
          }}
        />
        {errors.customerId ? (
          <Text variant="bodySmall" style={{ color: theme.colors.error, marginLeft: 4, marginTop: 6 }}>
            {errors.customerId.message}
          </Text>
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
              onMoveUp={index > 0 ? () => move(index, index - 1) : undefined}
              onMoveDown={index < fields.length - 1 ? () => move(index, index + 1) : undefined}
              priceInput={priceInputs[field.id] ?? ""}
              onPriceInputChange={(text) => setPriceInputs((prev) => ({ ...prev, [field.id]: text }))}
              label={fields.length > 1 ? `Regel ${index + 1}` : "Omschrijving"}
            />
          ))}
          {errors.items?.root?.message ? (
            <Text variant="bodySmall" style={{ color: theme.colors.error, marginLeft: 4, marginTop: 4 }}>
              {errors.items.root.message}
            </Text>
          ) : null}

          <Button
            mode="outlined"
            onPress={addLine}
            accessibilityLabel="Regel toevoegen"
            icon={({ size, color }) => <Plus color={color} size={size} />}
            style={{ marginTop: 4, borderRadius: 14, borderStyle: "dashed", borderColor: theme.colors.outline }}
            textColor={theme.colors.primary}
          >
            Regel toevoegen
          </Button>
        </View>

        <Card className="mt-5 px-4 py-4">
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Totaal (incl. BTW)
          </Text>
          <Text variant="headlineMedium" style={{ marginTop: 4, fontWeight: "700", color: theme.colors.onSurface }}>
            {formatEuroCents(totals.totalCents)}
          </Text>
          <Text variant="bodySmall" style={{ marginTop: 4, color: theme.colors.onSurfaceVariant }}>
            {formatEuroCents(totals.subtotalCents)}
            {vatBreakdown.length > 0
              ? " + " + vatBreakdown.map(([rate, cents]) => `${formatEuroCents(cents)} BTW (${rate}%)`).join(" + ")
              : ""}
          </Text>
        </Card>

        <Button
          mode="outlined"
          onPress={saveDraft}
          disabled={!canSaveDraft}
          accessibilityLabel="Bewaar als concept"
          style={{ marginTop: 16, borderRadius: 14, borderColor: theme.colors.outline }}
          textColor={theme.colors.onSurface}
        >
          {savedDraftPulse ? "Concept opgeslagen ✓" : "Bewaar als concept"}
        </Button>
      </ScrollView>

      <View className="px-4 pb-6 pt-2">
        <AsyncActionButton
          state={!canSend ? "disabled" : buttonState}
          label="Verstuur"
          accessibilityLabel={`Verstuur factuur van ${formatEuroCents(totals.totalCents)}${
            selectedCustomer ? ` aan ${selectedCustomer.name}` : ""
          }`}
          onPress={submitInvoice}
        />
        <Text variant="bodySmall" style={{ marginTop: 10, textAlign: "center", color: theme.colors.onSurfaceVariant }}>
          {selectedCustomer ? `${selectedCustomer.name} ontvangt de factuur per e-mail` : "Kies eerst een klant"}
        </Text>
      </View>

      <CustomerPickerSheet
        visible={pickerVisible}
        customers={customers}
        onSelect={selectCustomer}
        onCreateNew={() => {
          setPickerVisible(false);
          setQuickAddVisible(true);
        }}
        onClose={() => setPickerVisible(false)}
      />

      <QuickAddCustomerSheet
        visible={quickAddVisible}
        onCreate={(customer) => {
          addCustomer(customer);
          selectCustomer(customer);
          setQuickAddVisible(false);
        }}
        onClose={() => setQuickAddVisible(false)}
      />

      <ConfirmDialog
        visible={deleteDraftVisible}
        title="Concept verwijderen?"
        message="Dit concept wordt permanent verwijderd. Dit kan niet ongedaan worden gemaakt."
        confirmLabel="Verwijderen"
        destructive
        onConfirm={confirmDeleteDraft}
        onCancel={() => setDeleteDraftVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}
