import { ScrollView, Text, View } from "react-native";
import { Building2 } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Card, CardRow } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCompanyProfile } from "@/features/company/CompanyProfileContext";

/**
 * Navigation destination only — full editing (branding, logo, lettertype,
 * kleuren, briefpapier) is explicitly out of scope for the drawer build.
 * Read-only summary of what onboarding already collected; falls back to a
 * placeholder if onboarding was never finished (see FRONTEND-CHECKLIST.md —
 * the auth gate doesn't yet enforce onboarding completion, so this is a
 * real, reachable state, not a hypothetical one).
 */
export default function CompanyProfilePlaceholderScreen() {
  const router = useRouter();
  const { data: company } = useCompanyProfile();

  if (!company) {
    return (
      <View className="flex-1 bg-bg">
        <EmptyState
          icon={Building2}
          title="Nog geen bedrijfsgegevens"
          subtitle="Rond eerst de bedrijfsonboarding af — daarna staan je gegevens hier."
          onPrimaryAction={() => router.push("/onboarding/company")}
          primaryActionLabel="Bedrijfsgegevens invullen"
        />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ padding: 16 }}>
      <Text className="mb-4 text-[13px] leading-5 text-muted">
        Volledige branding (logo, lettertype, kleuren, briefpapier) komt hier binnenkort. Dit zijn de gegevens die je
        bij onboarding hebt ingevuld.
      </Text>
      <Card>
        <CardRow>
          <Text className="text-[15px] text-ink">Bedrijfsnaam</Text>
          <Text className="text-[15px] font-medium text-ink">{company.name}</Text>
        </CardRow>
        <CardRow>
          <Text className="text-[15px] text-ink">KVK-nummer</Text>
          <Text className="text-[15px] font-medium text-ink">{company.kvkNummer || "—"}</Text>
        </CardRow>
        <CardRow>
          <Text className="text-[15px] text-ink">BTW-nummer</Text>
          <Text className="text-[15px] font-medium text-ink">{company.btwNummer || "—"}</Text>
        </CardRow>
        <CardRow isLast>
          <Text className="text-[15px] text-ink">KOR-vrijstelling</Text>
          <Text className="text-[15px] font-medium text-ink">{company.korExempt ? "Ja" : "Nee"}</Text>
        </CardRow>
      </Card>
    </ScrollView>
  );
}
