import { View, Text, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import { COLORS, SPACING, FONT, API_URL } from "../../constants";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // ✅ Frontend validation
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // ✅ LOCAL PROTOTYPE LOGIC
      if (email.trim().toLowerCase() === "customer@gmail.com" && password === "123456") {
        router.replace("/customer/home");
      } else if (email.trim().toLowerCase() === "chef@gmail.com" && password === "123456") {
        router.replace("/chef/chefscreen");
      } else {
        setError("Invalid credentials (Use: 123456)");
      }
    } catch (err) {
      setError("Prototype Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          padding: SPACING.lg,
          backgroundColor: COLORS.background,
        }}
      >
        {/* TITLE */}
        <Text
          style={{
            fontSize: FONT.title,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: SPACING.lg,
          }}
        >
          Café Login
        </Text>

        {/* ERROR MESSAGE */}
        {error ? (
          <Text
            style={{
              color: "red",
              textAlign: "center",
              marginBottom: SPACING.md,
            }}
          >
            {error}
          </Text>
        ) : null}

        {/* EMAIL */}
        <TextInput
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={{
            borderWidth: 1,
            borderColor: COLORS.border,
            borderRadius: 8,
            padding: SPACING.md,
            marginBottom: SPACING.md,
            backgroundColor: "#fff",
          }}
        />

        {/* PASSWORD */}
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={{
            borderWidth: 1,
            borderColor: COLORS.border,
            borderRadius: 8,
            padding: SPACING.md,
            marginBottom: SPACING.lg,
            backgroundColor: "#fff",
          }}
        />

        {/* LOGIN BUTTON */}
        <Pressable
          onPress={handleLogin}
          disabled={loading}
          style={{
            backgroundColor: COLORS.primary,
            padding: SPACING.md,
            borderRadius: 8,
            alignItems: "center",
            opacity: loading ? 0.6 : 1,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: FONT.normal,
              fontWeight: "bold",
            }}
          >
            {loading ? "Logging in..." : "LOGIN"}
          </Text>
        </Pressable>

        {/* DEMO CREDENTIALS (OPTIONAL, NICE FOR FIGJAM) */}
        <Text
          style={{
            textAlign: "center",
            marginTop: SPACING.md,
            fontSize: 12,
            color: "#666",
          }}
        >
          Demo: kitchen@cafename.com | customer@gmail.com
        </Text>
      </View>
    </SafeAreaView>
  );
}
