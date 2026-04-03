import { View, Text, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "../../constants";
import { useResponsive } from "../../lib/responsive";

export default function Index() {
  const responsive = useResponsive();
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
        padding: responsive.screenPadding,
      }}
    >
      <Image
        source={require("../../assets/logo.png")}
        style={{
          width: responsive.isLarge ? 160 : responsive.isTablet ? 140 : 120,
          height: responsive.isLarge ? 160 : responsive.isTablet ? 140 : 120,
          marginBottom: responsive.gap + 8,
        }}
        resizeMode="contain"
      />

      <Text style={{ fontSize: responsive.titleSize, fontWeight: "bold", color: COLORS.text }}>
        Cafe App
      </Text>

      <Pressable
        onPress={() => router.push("/auth/register")}
        style={{
          marginTop: responsive.gap + 8,
          backgroundColor: COLORS.primary,
          paddingHorizontal: 32,
          paddingVertical: 14,
          borderRadius: 10,
          minWidth: 160,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: COLORS.buttonText,
            fontSize: responsive.bodySize,
            fontWeight: "bold",
          }}
        >
          START
        </Text>
      </Pressable>
    </View>
  );
}
