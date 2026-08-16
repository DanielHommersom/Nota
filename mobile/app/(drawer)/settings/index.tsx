import { useState } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Building2, ChevronRight, HelpCircle, LogOut, Palette, ShieldCheck } from "lucide-react-native";
import { useTheme } from "react-native-paper";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAuth } from "@/features/auth/AuthContext";
import * as authService from "@/features/auth/authService";
import { useCompanyProfile } from "@/features/company/CompanyProfileContext";

function SettingsRow({
  icon: Icon,
  label,
  sublabel,
  onPress,
  tone = "default",
}: {
  icon: typeof Building2;
  label: string;
  sublabel?: string;
  onPress: () => void;
  tone?: "default" | "danger";
}) {
  // theme.colors.*, not hardcoded hex — "#2563eb" was the pre-rebrand blue,
  // a leftover from before the "use the logo's colors" design-system pass
  // (src/theme/colors.js) that missed every raw color string like this one.
  const theme = useTheme();
  const iconColor = tone === "danger" ? theme.colors.error : theme.colors.primary;
  const textClass = tone === "danger" ? "text-warn" : "text-ink";
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="min-h-11 flex-row items-center justify-between border-b border-border px-4 py-3.5 active:bg-bg"
    >
      <View className="flex-row items-center gap-3">
        <Icon color={iconColor} size={18} />
        <View>
          <Text className={`text-[15px] font-medium ${textClass}`}>{label}</Text>
          {sublabel ? <Text className="mt-0.5 text-[12px] text-muted">{sublabel}</Text> : null}
        </View>
      </View>
      {tone === "danger" ? null : <ChevronRight color="#c4c4c8" size={16} />}
    </Pressable>
  );
}

/**
 * Real settings screen — previously a bare EmptyState placeholder
 * (FRONTEND-CHECKLIST.md: "no real settings content yet, as specced").
 * Company/branding editing already lives at /company-profile, so this
 * screen is the index that links out to it plus account-level actions,
 * rather than duplicating those forms here.
 */
export default function SettingsScreen() {
  const router = useRouter();
  const { data: company } = useCompanyProfile();
  const { setUser } = useAuth();
  const [logoutVisible, setLogoutVisible] = useState(false);

  async function confirmLogout() {
    setLogoutVisible(false);
    await authService.signOut();
    setUser(null);
  }

  return (
    <View className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ paddingVertical: 16 }}>
        <Text className="mb-2 ml-4 text-[12px] font-semibold uppercase tracking-wide text-muted">Bedrijf</Text>
        <View className="mx-4 overflow-hidden rounded-card border border-border bg-card">
          <SettingsRow
            icon={Building2}
            label="Bedrijfsprofiel"
            sublabel={company?.name ?? "Nog niet ingevuld"}
            onPress={() => router.push("/company-profile")}
          />
          <SettingsRow icon={Palette} label="Branding" sublabel="Logo, lettertype, kleur, briefpapier" onPress={() => router.push("/company-profile/branding")} />
        </View>

        <Text className="mb-2 ml-4 mt-6 text-[12px] font-semibold uppercase tracking-wide text-muted">Account</Text>
        <View className="mx-4 overflow-hidden rounded-card border border-border bg-card">
          <SettingsRow
            icon={HelpCircle}
            label="Help & support"
            onPress={() => void Linking.openURL("mailto:support@nota.app")}
          />
          <SettingsRow icon={ShieldCheck} label="Privacy & voorwaarden" onPress={() => void Linking.openURL("https://nota.app/privacy")} />
          <Pressable
            onPress={() => setLogoutVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Uitloggen"
            className="min-h-11 flex-row items-center gap-3 px-4 py-3.5 active:bg-bg"
          >
            <LogOut color="#b45309" size={18} />
            <Text className="text-[15px] font-medium text-warn">Uitloggen</Text>
          </Pressable>
        </View>

        <Text className="mt-8 text-center text-[12px] text-muted">Nota · versie 1.0.0</Text>
      </ScrollView>

      <ConfirmDialog
        visible={logoutVisible}
        title="Uitloggen?"
        message="Je moet opnieuw inloggen om weer bij je facturen te kunnen."
        confirmLabel="Uitloggen"
        destructive
        onConfirm={() => {
          void confirmLogout();
        }}
        onCancel={() => setLogoutVisible(false)}
      />
    </View>
  );
}
