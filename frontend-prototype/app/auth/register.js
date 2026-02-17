import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import { COLORS, SPACING, FONT, API_URL } from "../../constants";

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password || !confirmPassword) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      // ✅ LOCAL PROTOTYPE LOGIC
      Alert.alert("Prototype Mode", "Account created successfully (local only)");
      router.replace("/auth/login");
    } catch (err) {
      Alert.alert("Error", "Prototype Error");
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
          Create Account
        </Text>

        {/* NAME */}
        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
          style={{
            borderWidth: 1,
            borderColor: COLORS.border,
            borderRadius: 8,
            padding: SPACING.md,
            marginBottom: SPACING.md,
            backgroundColor: "#fff",
          }}
        />

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

        {/* PHONE */}
        <TextInput
          placeholder="Phone"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
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
            marginBottom: SPACING.md,
            backgroundColor: "#fff",
          }}
        />

        {/* CONFIRM PASSWORD */}
        <TextInput
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={{
            borderWidth: 1,
            borderColor: COLORS.border,
            borderRadius: 8,
            padding: SPACING.md,
            marginBottom: SPACING.lg,
            backgroundColor: "#fff",
          }}
        />

        {/* REGISTER BUTTON */}
        <Pressable
          onPress={handleRegister}
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
              color: COLORS.buttonText,
              fontSize: FONT.normal,
              fontWeight: "bold",
            }}
          >
            {loading ? "Creating..." : "REGISTER"}
          </Text>
        </Pressable>

        {/* LOGIN LINK */}
        <Pressable
          onPress={() => router.replace("/auth/login")}
          style={{ marginTop: SPACING.md }}
        >
          <Text style={{ textAlign: "center", color: COLORS.primary }}>
            Already have an account? Login
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
