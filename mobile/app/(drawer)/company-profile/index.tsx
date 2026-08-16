import { Pressable, ScrollView, Text, View } from "react-native";
import { Building2, ChevronRight, Palette, Pencil } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "react-native-paper";
import { Card, CardRow } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCompanyProfile } from "@/features/company/CompanyProfileContext";

/**
 * Read-only summary of the company profile, now with real edit/branding
 * entry points — closes the FRONTEND-CHECKLIST.md gap ("full editing ...
 * is explicitly out of scope"). Edit and branding live as root-level
 * screens (app/company-profile/edit.tsx, app/company-profile/branding.tsx),
 * matching the existing convention that drill-in forms sit outside the
 * drawer group.
 */
export default function CompanyProfileScreen() {
  // theme.colors.primary, not the hardcoded "#2563eb" (pre-rebrand blue)
  // this used to render below — see the identical fix/comment in
  // app/(drawer)/settings/index.tsx.
  const theme = useTheme();
  const router = useRouter();
  const { data: company, isLoading } = useCompanyProfile();

  if (isLoading) return <View className="flex-1 bg-bg" />;

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
      <Card>
        <CardRow>
          <Text className="text-[15px] text-ink">Bedrijfsnaam</Text>
          <Text className="text-[15px] font-medium text-ink">{company.name}</Text>
        </CardRow>
        <CardRow>
          <Text className="text-[15px] text-ink">Adres</Text>
          <Text className="max-w-[60%] text-right text-[15px] font-medium text-ink">
            {company.address.street} {company.address.houseNumber}
            {"\n"}
            {company.address.postcode} {company.address.city}
          </Text>
        </CardRow>
        <CardRow>
          <Text className="text-[15px] text-ink">KVK-nummer</Text>
          <Text className="text-[15px] font-medium text-ink">{company.kvkNummer || "—"}</Text>
        </CardRow>
        <CardRow>
          <Text className="text-[15px] text-ink">BTW-nummer</Text>
          <Text className="text-[15px] font-medium text-ink">{company.korExempt ? "Vrijgesteld (KOR)" : company.btwNummer || "—"}</Text>
        </CardRow>
        <CardRow isLast>
          <Text className="text-[15px] text-ink">KOR-vrijstelling</Text>
          <Text className="text-[15px] font-medium text-ink">{company.korExempt ? "Ja" : "Nee"}</Text>
        </CardRow>
      </Card>

      <View className="mt-5 gap-3">
        <Pressable
          onPress={() => router.push("/company-profile/edit")}
          accessibilityRole="button"
          accessibilityLabel="Bedrijfsprofiel bewerken"
          className="min-h-11 flex-row items-center justify-between rounded-control bg-card px-4 py-3.5 border border-border"
        >
          <View className="flex-row items-center gap-3">
            <Pencil color={theme.colors.primary} size={18} />
            <Text className="text-[15px] font-medium text-ink">Bedrijfsgegevens bewerken</Text>
          </View>
          <ChevronRight color="#c4c4c8" size={16} />
        </Pressable>
        <Pressable
          onPress={() => router.push("/company-profile/branding")}
          accessibilityRole="button"
          accessibilityLabel="Branding instellen"
          className="min-h-11 flex-row items-center justify-between rounded-control bg-card px-4 py-3.5 border border-border"
        >
          <View className="flex-row items-center gap-3">
            <Palette color={theme.colors.primary} size={18} />
            <Text className="text-[15px] font-medium text-ink">Branding (logo, kleur, briefpapier)</Text>
          </View>
          <ChevronRight color="#c4c4c8" size={16} />
        </Pressable>
      </View>
    </ScrollView>
  );
}
