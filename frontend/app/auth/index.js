import { View, Text, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import { COLORS, SPACING, FONT } from "../../constants";

export default function Index() {
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
        padding: SPACING.md,
      }}
    >
      {/* LOGO */}
      <Image
        source={require("../../assets/logo.png")}
        style={{ width: 140, height: 140, marginBottom: SPACING.lg }}
        resizeMode="contain"
      />

      {/* APP NAME */}
      <Text style={{ fontSize: FONT.title, fontWeight: "bold", color: COLORS.text }}>
        Cafe App
      </Text>

      {/* START BUTTON */}
      <Pressable
        onPress={() => router.push("/auth/register")}
        style={{
          marginTop: SPACING.lg, // safe spacing, no undefined value
          backgroundColor: COLORS.primary,
          paddingHorizontal: SPACING.lg,
          paddingVertical: SPACING.md,
          borderRadius: 8,
        }}
      >
        <Text
          style={{
            color: COLORS.buttonText,
            fontSize: FONT.normal,
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          START
        </Text>
      </Pressable>
    </View>
  );
}
