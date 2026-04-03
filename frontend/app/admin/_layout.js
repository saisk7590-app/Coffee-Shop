import { Pressable, Platform } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../../constants";
import { useResponsive } from "../../lib/responsive";

export default function AdminLayout() {
  const responsive = useResponsive();
  const router = useRouter();

  const headerActions = () => (
    <>
      <Pressable
        onPress={() => router.push("/customer/profile")}
        style={{ marginRight: SPACING.md }}
      >
        <Ionicons name="person-circle-outline" size={responsive.iconSize + 2} color={COLORS.primary} />
      </Pressable>
      <Pressable
        onPress={() => router.replace("/auth/login")}
        style={{ marginRight: SPACING.md }}
      >
        <Ionicons name="log-out-outline" size={responsive.iconSize + 2} color={COLORS.primary} />
      </Pressable>
    </>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarLabelStyle: {
          fontSize: 11,
          marginBottom: Platform.OS === "android" ? 3 : 0,
        },
        tabBarStyle: {
          height: Platform.OS === "android" ? 62 : 64,
          paddingTop: 6,
          paddingBottom: Platform.OS === "android" ? 8 : 4,
        },
        headerTitleStyle: {
          fontSize: responsive.subtitleSize,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          headerRight: headerActions,
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          headerRight: headerActions,
          tabBarIcon: ({ color, size }) => <Ionicons name="analytics-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          headerRight: headerActions,
          tabBarIcon: ({ color, size }) => <Ionicons name="cafe-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Products",
          headerRight: headerActions,
          tabBarIcon: ({ color, size }) => <Ionicons name="basket-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
