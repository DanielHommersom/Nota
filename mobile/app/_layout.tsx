import "../global.css";

import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Redirect, Stack, useSegments } from "expo-router";
import { InvoiceStoreProvider } from "@/features/invoices/InvoiceStore";
import { AuthProvider, useAuth } from "@/features/auth/AuthContext";

/**
 * Gates every route behind auth. Unauthenticated + not already under
 * /auth -> redirect to /auth (never automatically to a login screen — the
 * auth screen itself defaults to signup, per spec). Authenticated + still
 * on /auth -> bounce to the app, so a signed-in user can't navigate back
 * into the auth screen (e.g. via the browser back button on web).
 */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator color="#2563eb" />
      </View>
    );
  }

  const inAuthRoute = segments[0] === "auth";

  if (!user && !inAuthRoute) {
    return <Redirect href="/auth" />;
  }
  if (user && inAuthRoute) {
    return <Redirect href="/" />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <AuthProvider>
          <InvoiceStoreProvider>
            <AuthGate>
              <Stack
                screenOptions={{
                  headerShadowVisible: false,
                  headerTitleStyle: { fontSize: 17, fontWeight: "600" },
                  contentStyle: { backgroundColor: "#f7f7f8" },
                }}
              >
                <Stack.Screen name="index" options={{ title: "Facturen" }} />
                <Stack.Screen
                  name="invoice/new"
                  options={{ title: "Nieuwe factuur", presentation: "modal" }}
                />
                <Stack.Screen name="invoice/[id]" options={{ title: "Factuur" }} />
                <Stack.Screen
                  name="customer/new"
                  options={{ title: "Nieuwe klant", presentation: "modal" }}
                />
                <Stack.Screen
                  name="onboarding/company"
                  options={{ title: "Bedrijfsgegevens", headerBackVisible: false }}
                />
                <Stack.Screen name="auth/index" options={{ headerShown: false }} />
              </Stack>
            </AuthGate>
          </InvoiceStoreProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
