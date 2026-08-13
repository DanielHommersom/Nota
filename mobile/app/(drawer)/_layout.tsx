import { Pressable } from "react-native";
import { Drawer } from "expo-router/drawer";
import { useNavigation } from "expo-router";
import { Menu } from "lucide-react-native";
import { AppDrawerContent } from "@/features/navigation/AppDrawerContent";

/**
 * Only the primary/list-style screens live inside the drawer (Facturen,
 * Klanten, Bedrijfsprofiel, Instellingen). Modal flows (invoice/new,
 * invoice/[id], customer/new) and onboarding stay as root-level Stack
 * screens in app/_layout.tsx, presented over the drawer rather than being
 * drawer destinations themselves — the drawer is secondary navigation, not
 * the path into the core "create and send an invoice" flow.
 *
 * Open/close swipe and slide animation come from the navigator itself
 * (react-native-drawer-layout, Reanimated-backed) — no custom animation
 * code needed for that to feel smooth.
 */
export default function AppDrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: { fontSize: 17, fontWeight: "600" },
        headerLeft: () => <HamburgerButton />,
        drawerActiveTintColor: "#2563eb",
        drawerType: "front",
      }}
    >
      <Drawer.Screen name="index" options={{ title: "Facturen" }} />
      <Drawer.Screen name="customers/index" options={{ title: "Klanten" }} />
      <Drawer.Screen name="company-profile/index" options={{ title: "Bedrijfsprofiel" }} />
      <Drawer.Screen name="settings/index" options={{ title: "Instellingen" }} />
    </Drawer>
  );
}

/**
 * expo-router forbids importing @react-navigation/native directly (it
 * forks/replaces it internally as of SDK 56) — navigation.toggleDrawer()
 * is expo-router's own documented way to reach this, no DrawerActions
 * import needed. See https://docs.expo.dev/router/migrate/sdk-55-to-56/.
 */
function HamburgerButton() {
  const navigation = useNavigation<{ toggleDrawer: () => void }>();
  return (
    <Pressable
      onPress={() => navigation.toggleDrawer()}
      accessibilityRole="button"
      accessibilityLabel="Menu openen"
      hitSlop={8}
      className="h-11 w-11 items-center justify-center"
    >
      <Menu color="#1a1a1a" size={22} />
    </Pressable>
  );
}
