import { useRouter } from "expo-router";
import { CompanyProfileForm } from "@/features/company/CompanyProfileForm";
import { useCompanyProfile } from "@/features/company/CompanyProfileContext";
import type { CompanyProfileFormValues } from "@/features/company/schema";

/**
 * Closes the gap flagged in FRONTEND-CHECKLIST.md: "onboarding is still a
 * one-way door for actually changing anything — there's no way back in to
 * fix a typo in your KVK-nummer later." Root-level Stack screen (outside
 * the (drawer) group), same convention as customer/new.tsx and invoice/
 * new.tsx — a drill-in edit form, not a drawer destination itself.
 */
export default function EditCompanyProfileScreen() {
  const router = useRouter();
  const { data: company, setCompanyProfile } = useCompanyProfile();

  const defaultValues: CompanyProfileFormValues = {
    name: company?.name ?? "",
    kvkNummer: company?.kvkNummer ?? "",
    btwNummer: company?.btwNummer ?? "",
    korExempt: company?.korExempt ?? false,
    address: company?.address ?? { street: "", houseNumber: "", postcode: "", city: "" },
  };

  function save(values: CompanyProfileFormValues) {
    setCompanyProfile({
      name: values.name.trim(),
      kvkNummer: values.kvkNummer.trim(),
      btwNummer: values.btwNummer?.trim() ?? "",
      korExempt: values.korExempt,
      address: {
        street: values.address.street.trim(),
        houseNumber: values.address.houseNumber.trim(),
        postcode: values.address.postcode.trim(),
        city: values.address.city.trim(),
      },
      logoUrl: company?.logoUrl ?? null,
    });
    router.back();
  }

  return <CompanyProfileForm defaultValues={defaultValues} onSubmit={save} submitLabel="Wijzigingen opslaan" />;
}
