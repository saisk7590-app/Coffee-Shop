import { View, Text, Pressable, Animated, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants";
import { useResponsive } from "../../lib/responsive";

const actions = [
  { label: "Menu", route: "/customer/menu", color: COLORS.primary, icon: "restaurant-outline" },
  { label: "My Orders", route: "/customer/my-orders", color: COLORS.accent, icon: "receipt-outline" },
  { label: "Products", route: "/customer/products", color: "#2E211B", icon: "basket-outline" },
];

export default function Home() {
  const responsive = useResponsive();
  const router = useRouter();
  const { successMessage } = useLocalSearchParams();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-10)).current;
  const [showMessage, setShowMessage] = useState(!!successMessage);

  useEffect(() => {
    if (successMessage) {
      setShowMessage(true);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 600, useNativeDriver: true }).start(() => {
          setShowMessage(false);
          router.replace("/customer/home");
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [successMessage, fadeAnim, slideAnim, router]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ padding: responsive.screenPadding }}>
        <View style={{ width: responsive.contentWidth }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: responsive.gap }}>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={{ fontSize: responsive.titleSize, fontWeight: "bold", color: COLORS.text }}>
                Welcome to Cafe
              </Text>
              <Text style={{ color: COLORS.mutedText, marginTop: 4, fontSize: responsive.bodySize }}>
                Browse menu items, products, and orders on any screen size.
              </Text>
            </View>

            <Pressable
              onPress={() => router.push("/customer/profile")}
              style={{
                width: responsive.isLarge ? 56 : 48,
                height: responsive.isLarge ? 56 : 48,
                borderRadius: 999,
                backgroundColor: "#fff",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              <Ionicons name="person-outline" size={responsive.iconSize} color={COLORS.primary} />
            </Pressable>
          </View>

          {showMessage ? (
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                backgroundColor: "#E6F4EA",
                borderColor: "#2E7D32",
                borderWidth: 1,
                padding: responsive.gap / 1.5,
                borderRadius: 10,
                marginBottom: responsive.gap,
              }}
            >
              <Text style={{ color: "#2E7D32", textAlign: "center", fontWeight: "600", fontSize: responsive.bodySize }}>
                {successMessage}
              </Text>
            </Animated.View>
          ) : null}

          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
            {actions.map((item) => (
              <Pressable
                key={item.label}
                onPress={() => router.push(item.route)}
                style={{
                  width: responsive.isMobile ? responsive.innerWidth : responsive.cardWidth,
                  backgroundColor: item.color,
                  padding: responsive.isLarge ? 24 : responsive.isCompactPhone ? 14 : 18,
                  borderRadius: 14,
                  marginBottom: responsive.gap,
                }}
              >
                <Ionicons name={item.icon} size={responsive.iconSize + (responsive.isAndroidPhone ? 2 : 4)} color="#fff" />
                <Text style={{ color: "#fff", fontSize: responsive.subtitleSize, fontWeight: "bold", marginTop: responsive.isAndroidPhone ? 8 : responsive.isCompactPhone ? 10 : 14 }}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
