import { View, Text, Pressable, Animated } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { COLORS, SPACING, FONT } from "../../constants";

export default function Home() {
  const router = useRouter();
  const { successMessage } = useLocalSearchParams();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-10)).current;

  const [showMessage, setShowMessage] = useState(!!successMessage);

  useEffect(() => {
    if (successMessage) {
      // Fade + slide in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after 3 seconds
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }).start(() => setShowMessage(false));
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
        padding: SPACING.lg,
      }}
    >
      {/* TITLE */}
      <Text
        style={{
          fontSize: FONT.title,
          fontWeight: "bold",
          marginBottom: SPACING.md,
          textAlign: "center",
        }}
      >
        Welcome to Café ☕
      </Text>

      {/* ✅ SUCCESS MESSAGE */}
      {showMessage && (
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            backgroundColor: "#E6F4EA",
            borderColor: "#2E7D32",
            borderWidth: 1,
            padding: SPACING.sm,
            borderRadius: 8,
            marginBottom: SPACING.lg,
            width: "90%",
          }}
        >
          <Text
            style={{
              color: "#2E7D32",
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            {successMessage}
          </Text>
        </Animated.View>
      )}

      {/* MENU BUTTON */}
      <Pressable
        onPress={() => router.push("/customer/menu")}
        style={{
          backgroundColor: COLORS.primary,
          width: "80%",
          padding: SPACING.md,
          borderRadius: 12,
          marginBottom: SPACING.md,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontSize: FONT.normal, fontWeight: "bold" }}>
          Menu
        </Text>
      </Pressable>

      {/* PROFILE BUTTON */}
      <Pressable
        onPress={() => router.push("/customer/profile")}
        style={{
          backgroundColor: COLORS.secondary,
          width: "80%",
          padding: SPACING.md,
          borderRadius: 12,
          marginBottom: SPACING.md,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontSize: FONT.normal, fontWeight: "bold" }}>
          Profile
        </Text>
      </Pressable>

      {/* MY ORDERS BUTTON */}
      <Pressable
        onPress={() => router.push("/customer/my-orders")}
        style={{
          backgroundColor: COLORS.accent,
          width: "80%",
          padding: SPACING.md,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontSize: FONT.normal, fontWeight: "bold" }}>
          My Orders
        </Text>
      </Pressable>
    </View>
  );
}
