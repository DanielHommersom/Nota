import { useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { DrawerContentScrollView, type DrawerContentComponentProps } from "expo-router/drawer";
import { useRouter, usePathname } from "expo-router";
import {
  Building2,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  Users,
  X,
} from "lucide-react-native";
import { useTheme } from "react-native-paper";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAuth } from "@/features/auth/AuthContext";
import * as authService from "@/features/auth/authService";
import { useCompanyProfile } from "@/features/company/CompanyProfileContext";
import { useSubscriptionStatus } from "@/features/subscription/useSubscriptionStatus";
import { companyInitials } from "./companyInitials";
import { MenuItem } from "./MenuItem";

const SUPPORT_EMAIL = "support@nota.app";

/**
 * Custom drawer content, replacing @react-navigation/drawer's default.
 * Tap-outside-to-close and swipe-back are the navigator's own built-in
 * behavior (react-native-drawer-layout, Reanimated-backed) — nothing extra
 * needed here for those. This component only adds the explicit close
 * button, since the spec wants all three close methods available.
 */
export function AppDrawerContent(props: DrawerContentComponentProps) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { data: company } = useCompanyProfile();
  const { data: subscription } = useSubscriptionStatus();
  const { setUser } = useAuth();
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);

  function go(href: string) {
    props.navigation.closeDrawer();
    router.push(href);
  }

  function openSupportEmail() {
    props.navigation.closeDrawer();
    void Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
  }

  async function confirmLogout() {
    setLogoutConfirmVisible(false);
    props.navigation.closeDrawer();
    await authService.signOut();
    // AuthGate in the root layout redirects to /auth automatically once
    // user becomes null — no explicit navigation call needed here.
    setUser(null);
  }

  const subscriptionLabel = subscription
    ? subscription.plan === "pro"
      ? "Pro"
      : `Gratis · ${subscription.invoicesUsed}/${subscription.invoicesLimit} facturen`
    : "";

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flexGrow: 1, paddingTop: 0 }}>
      <View className="flex-1">
        <View className="flex-row items-start justify-between border-b border-border px-4 pb-4 pt-2">
          <Pressable
            onPress={() => go("/company-profile")}
            accessibilityRole="button"
            accessibilityLabel={company ? `Bedrijfsprofiel van ${company.name}` : "Bedrijfsgegevens invullen"}
            className="min-h-11 flex-1 flex-row items-center gap-3 pr-2"
          >
            <View className="h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
              {company ? (
                <Text className="text-[15px] font-semibold text-accent">{companyInitials(company.name)}</Text>
              ) : (
                // theme.colors.primary, not the old "#2563eb" pre-rebrand
                // blue this used to hardcode — see the identical comment in
                // EmptyState.tsx for why that leftover survived the
                // colors.js rebrand pass unnoticed.
                <Building2 color={theme.colors.primary} size={22} />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-semibold text-ink" numberOfLines={1}>
                {company?.name ?? "Vul je bedrijfsgegevens in"}
              </Text>
              <Text className="mt-0.5 text-[12px] text-muted" numberOfLines={1}>
                {subscriptionLabel}
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => props.navigation.closeDrawer()}
            accessibilityRole="button"
            accessibilityLabel="Menu sluiten"
            hitSlop={8}
            className="h-11 w-11 items-center justify-center"
          >
            <X color="#6b6b70" size={20} />
          </Pressable>
        </View>

        <View className="flex-1 px-2 pt-3">
          <MenuItem icon={LayoutDashboard} label="Dashboard" active={pathname === "/"} onPress={() => go("/")} />
          <MenuItem
            icon={FileText}
            label="Facturen"
            active={pathname === "/invoices"}
            onPress={() => go("/invoices")}
          />
          <MenuItem icon={Plus} label="Nieuwe factuur" onPress={() => go("/invoice/new")} />
          <MenuItem
            icon={Users}
            label="Klanten"
            active={pathname.startsWith("/customers")}
            onPress={() => go("/customers")}
          />
          <MenuItem
            icon={Building2}
            label="Bedrijfsprofiel"
            active={pathname.startsWith("/company-profile")}
            onPress={() => go("/company-profile")}
          />
          <MenuItem
            icon={Settings}
            label="Instellingen"
            active={pathname.startsWith("/settings")}
            onPress={() => go("/settings")}
          />
          <MenuItem icon={HelpCircle} label="Help & support" onPress={openSupportEmail} />
        </View>

        <View className="px-2 pb-4">
          <MenuItem
            icon={LogOut}
            label="Uitloggen"
            tone="danger"
            accessibilityLabel="Uitloggen"
            onPress={() => setLogoutConfirmVisible(true)}
          />
        </View>
      </View>

      <ConfirmDialog
        visible={logoutConfirmVisible}
        title="Uitloggen?"
        message="Je moet opnieuw inloggen om weer bij je facturen te kunnen."
        confirmLabel="Uitloggen"
        destructive
        onConfirm={() => {
          void confirmLogout();
        }}
        onCancel={() => setLogoutConfirmVisible(false)}
      />
    </DrawerContentScrollView>
  );
}
