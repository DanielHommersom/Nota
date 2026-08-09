import "../global.css";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import { InvoiceStoreProvider } from "@/features/invoices/InvoiceStore";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <InvoiceStoreProvider>
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
            <Stack.Screen name="auth/sign-in" options={{ headerShown: false }} />
          </Stack>
        </InvoiceStoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
