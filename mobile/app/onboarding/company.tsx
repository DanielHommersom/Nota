import { CompanyProfileForm } from "@/features/company/CompanyProfileForm";
import { useCompanyProfile } from "@/features/company/CompanyProfileContext";
import type { CompanyProfileFormValues } from "@/features/company/schema";

const BLANK_VALUES: CompanyProfileFormValues = {
  name: "",
  kvkNummer: "",
  btwNummer: "",
  korExempt: false,
  address: { street: "", houseNumber: "", postcode: "", city: "" },
};

/**
 * One-time company onboarding step, now sharing its fields (incl. address —
 * FRONTEND-CHECKLIST.md/CHECKLIST.md both list a KVK-nummer + BTW-nummer +
 * kor_exempt + adres profile) with the later edit screen via
 * CompanyProfileForm. Writes into the same AsyncStorage-backed
 * CompanyProfileContext the drawer and the auth gate read from.
 *
 * Deliberately does *not* navigate away itself after saving — app/_layout
 * .tsx's AuthGate does that reactively once `company` actually becomes
 * non-null, the same way it already handles the auth->app transition. An
 * earlier version called router.replace("/") right here, which raced
 * AuthGate's own redirect-to-onboarding check and could bounce the user
 * straight back to a blank form right after they filled it in.
 */
export default function CompanyOnboardingScreen() {
  const { setCompanyProfile } = useCompanyProfile();

  function saveAndContinue(values: CompanyProfileFormValues) {
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
      logoUrl: null,
    });
  }

  return (
    <CompanyProfileForm
      defaultValues={BLANK_VALUES}
      onSubmit={saveAndContinue}
      submitLabel="Doorgaan"
      introCopy="Deze gegevens komen op elke factuur te staan. Je hoeft dit maar één keer in te vullen — later aan te passen via Instellingen."
    />
  );
}
