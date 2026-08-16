import "../global.css";
import "@/theme/paperInterop";

import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Redirect, Stack, useSegments } from "expo-router";
import { PaperProvider, useTheme } from "react-native-paper";
import type { IconProps } from "react-native-paper/lib/typescript/components/MaterialCommunityIcon";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { paperTheme } from "@/theme/paperTheme";
import { InvoiceStoreProvider } from "@/features/invoices/InvoiceStore";
import { CustomerStoreProvider } from "@/features/customers/CustomerStore";
import { CompanyProfileProvider, useCompanyProfile } from "@/features/company/CompanyProfileContext";
import { BrandingProvider } from "@/features/branding/BrandingContext";
import { AuthProvider, useAuth } from "@/features/auth/AuthContext";

/**
 * Renders the Material icon set Paper's own components reach for by
 * default (Dialog icons, TextInput.Icon, List.Icon, ...) via
 * @expo/vector-icons — already bundled with Expo, no font-linking step
 * needed the way a bare react-native-vector-icons install would require.
 * Nota's own icons (in screens/feature components) stay on lucide-
 * react-native; this only covers Paper's internal default icon slots.
 */
function PaperIcon({ name, color, size }: IconProps) {
  return <MaterialCommunityIcons name={name} color={color ?? "#1a1a1a"} size={size} />;
}

/**
 * Gates every route behind auth, and now also behind onboarding
 * completion — closing the gap FRONTEND-CHECKLIST.md flagged explicitly:
 * "a user who signs up, backs out of onboarding, and reopens the app later
 * lands straight on the invoice list with no company profile." That was
 * blocked before only on CompanyProfileContext not surviving a reload; now
 * that it's AsyncStorage-backed (see companyProfileStorage.ts), this gate
 * can actually check against real data instead of always seeing `null`.
 *
 * Unauthenticated + not already under /auth -> redirect to /auth (never
 * automatically to a login screen — the auth screen itself defaults to
 * signup, per spec). Authenticated + still on /auth -> bounce to the app.
 * Authenticated + no company profile + not already under /onboarding ->
 * send them to finish onboarding before anything else.
 */
function AuthGate({ children }: { children: React.ReactNode }) {
  // theme.colors.primary, not the hardcoded "#2563eb" this used to render —
  // the pre-rebrand blue, left behind by the "use the logo's colors"
  // design-system pass the same way as the other spots fixed alongside
  // this one (EmptyState, MenuItem, StatCard, AppDrawerContent): a raw
  // string instead of a theme lookup, so it never picked up the new teal.
  // AuthGate renders inside PaperProvider (see RootLayout below), so
  // useTheme() here reads the same app-wide theme every other screen does.
  const theme = useTheme();
  const { user, isLoading: authLoading } = useAuth();
  const { data: company, isLoading: companyLoading } = useCompanyProfile();
  const segments = useSegments();

  if (authLoading || (user && companyLoading)) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  const inAuthRoute = segments[0] === "auth";
  const inOnboardingRoute = segments[0] === "onboarding";

  if (!user && !inAuthRoute) {
    return <Redirect href="/auth" />;
  }
  if (user && inAuthRoute) {
    return <Redirect href="/" />;
  }
  if (user && !company && !inOnboardingRoute) {
    return <Redirect href="/onboarding/company" />;
  }
  // Reactive, not imperative: onboarding/company.tsx only calls
  // setCompanyProfile and lets this gate carry the user forward once the
  // context value actually updates — the same pattern the auth<->app
  // transition above already uses. An earlier version had the onboarding
  // screen call router.replace("/") itself right after setCompanyProfile,
  // which raced this gate's own redirect-back-to-onboarding check above
  // (company could still read as null on the very next render) and bounced
  // the user straight back to a blank onboarding form after they'd just
  // filled it in.
  if (user && company && inOnboardingRoute) {
    return <Redirect href="/" />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme} settings={{ icon: PaperIcon }}>
          <StatusBar style="dark" />
          <AuthProvider>
            <CompanyProfileProvider>
              <BrandingProvider>
                <CustomerStoreProvider>
                  <InvoiceStoreProvider>
                    <AuthGate>
                      <Stack
                        screenOptions={{
                          headerShadowVisible: false,
                          headerTitleStyle: { fontSize: 17, fontWeight: "600" },
                          contentStyle: { backgroundColor: paperTheme.colors.background },
                        }}
                      >
                        {/* The drawer (Dashboard, Facturen, Klanten, Bedrijfsprofiel,
                            Instellingen) owns its own headers per screen — hidden
                            here so they don't get a second header from this outer
                            Stack. */}
                        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
                        <Stack.Screen
                          name="invoice/new"
                          options={{ title: "Nieuwe factuur", presentation: "modal" }}
                        />
                        <Stack.Screen name="invoice/[id]" options={{ title: "Factuur" }} />
                        <Stack.Screen name="expenses/index" options={{ title: "Inkomend" }} />
                        <Stack.Screen
                          name="customer/new"
                          options={{ title: "Nieuwe klant", presentation: "modal" }}
                        />
                        <Stack.Screen
                          name="customer/[id]/edit"
                          options={{ title: "Klant bewerken", presentation: "modal" }}
                        />
                        <Stack.Screen
                          name="company-profile/edit"
                          options={{ title: "Bedrijfsgegevens bewerken" }}
                        />
                        <Stack.Screen name="company-profile/branding" options={{ title: "Branding" }} />
                        <Stack.Screen
                          name="onboarding/company"
                          options={{ title: "Bedrijfsgegevens", headerBackVisible: false }}
                        />
                        <Stack.Screen name="auth/index" options={{ headerShown: false }} />
                        <Stack.Screen name="auth/forgot-password" options={{ headerShown: false }} />
                        <Stack.Screen name="auth/reset-password" options={{ headerShown: false }} />
                      </Stack>
                    </AuthGate>
                  </InvoiceStoreProvider>
                </CustomerStoreProvider>
              </BrandingProvider>
            </CompanyProfileProvider>
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
