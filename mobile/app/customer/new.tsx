import { useRouter } from "expo-router";
import { CustomerForm } from "@/features/customers/CustomerForm";
import { useCustomerStore } from "@/features/customers/CustomerStore";
import type { CustomerFormValues } from "@/features/customers/schema";
import type { Customer } from "@/features/customers/types";

const BLANK_VALUES: CustomerFormValues = {
  name: "",
  email: "",
  isBusiness: false,
  kvkNummer: "",
  btwNummer: "",
  address: "",
  postcode: "",
  city: "",
  notes: "",
};

/**
 * Standalone "add customer" reached from the Klanten list (project brief
 * item 8). The other creation path — "on the fly" mid invoice (item 7) —
 * no longer routes through this screen; it uses
 * features/customers/QuickAddCustomerSheet, an in-place sheet layered on
 * top of the invoice form, after routing through here turned out to leave
 * two invoice/new screens mounted at once under expo-router's modal
 * presentation (see that file's comment for the full story).
 */
export default function NewCustomerScreen() {
  const router = useRouter();
  const { addCustomer } = useCustomerStore();

  function save(values: CustomerFormValues) {
    const customer: Customer = {
      id: `cust_${Date.now()}`,
      name: values.name.trim(),
      email: values.email?.trim() || undefined,
      isBusiness: values.isBusiness,
      kvkNummer: values.isBusiness ? values.kvkNummer?.trim() || undefined : undefined,
      btwNummer: values.isBusiness ? values.btwNummer?.trim() || undefined : undefined,
      address: values.address?.trim() || undefined,
      postcode: values.postcode?.trim() || undefined,
      city: values.city?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
    };
    addCustomer(customer);
    router.back();
  }

  return <CustomerForm defaultValues={BLANK_VALUES} onSubmit={save} submitLabel="Klant opslaan" />;
}
