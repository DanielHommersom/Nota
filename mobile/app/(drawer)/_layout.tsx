import { Drawer } from "expo-router/drawer";
import { useNavigation } from "expo-router";
import { HeaderButton } from "expo-router/react-navigation";
import { Menu } from "lucide-react-native";
import { useTheme } from "react-native-paper";
import { AppDrawerContent } from "@/features/navigation/AppDrawerContent";

/**
 * Only the primary/list-style screens live inside the drawer (Dashboard,
 * Facturen, Klanten, Bedrijfsprofiel, Instellingen). Modal flows
 * (invoice/new, invoice/[id], customer/new) and onboarding stay as
 * root-level Stack screens in app/_layout.tsx, presented over the drawer
 * rather than being drawer destinations themselves — the drawer is
 * secondary navigation, not the path into the core "create and send an
 * invoice" flow.
 *
 * "index" is the dashboard, not the Facturen list — it's the post-login
 * landing route (see app/_layout.tsx's AuthGate), and the dashboard is
 * what should greet you there now. The Facturen list moved to its own
 * "invoices/index" route so it can stay a drawer destination without
 * doubling as the landing page.
 *
 * Open/close swipe and slide animation come from the navigator itself
 * (react-native-drawer-layout, Reanimated-backed) — no custom animation
 * code needed for that to feel smooth.
 */
export default function AppDrawerLayout() {
  const theme = useTheme();

  return (
    <Drawer
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: { fontSize: 17, fontWeight: "600" },
        headerLeft: () => <HamburgerButton />,
        drawerActiveTintColor: theme.colors.primary,
        drawerType: "front",
      }}
    >
      <Drawer.Screen name="index" options={{ title: "Dashboard" }} />
      <Drawer.Screen name="invoices/index" options={{ title: "Facturen" }} />
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
 *
 * Renders via <HeaderButton> (from "expo-router/react-navigation") rather
 * than Paper's <IconButton>: HeaderButton is the exact primitive the
 * default drawer toggle button and every other header button in this app
 * (back buttons, close buttons) already render through — it's built and
 * measured specifically for the header's headerLeft/headerRight slots
 * (PlatformPressable, correct hitSlop, no fixed sizing that a
 * general-purpose Material button carries). This fixes a real bug: the
 * previous IconButton-based version intermittently failed to render in
 * the header slot on some screens, since IconButton is designed for
 * standalone use, not for being measured inside React Navigation's header
 * layout engine.
 */
function HamburgerButton() {
  const theme = useTheme();
  const navigation = useNavigation<{ toggleDrawer: () => void }>();
  return (
    <HeaderButton onPress={() => navigation.toggleDrawer()} accessibilityLabel="Menu openen">
      <Menu color={theme.colors.onSurface} size={22} />
    </HeaderButton>
  );
}
