import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { COLORS, SPACING, FONT } from "../../constants";

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleRegister = async () => {
    console.log("REGISTER BUTTON PRESSED");

    if (!name || !email || !phone || !password || !confirmPassword) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Invalid email");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // 🔹 Step 1: Create Auth User
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      if (!data.user) {
        Alert.alert("Error", "User not created");
        return;
      }

      // 🔹 Step 2: Insert into profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: data.user.id,
            name: name,
            phone: phone,
            role: "customer",
          },
        ]);

      if (profileError) {
        Alert.alert("Error", profileError.message);
        return;
      }

      Alert.alert("Success", "Account created successfully!");
      router.replace("/auth/login");

    } catch (err) {
      console.log("Register error:", err);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: SPACING.lg,
          backgroundColor: COLORS.background,
        }}
        keyboardShouldPersistTaps="handled"
      >
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

        <TextInput
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          style={inputStyle}
        />

        <TextInput
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={inputStyle}
        />

        <TextInput
          placeholder="Phone"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          style={inputStyle}
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={inputStyle}
        />

        <TextInput
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={{ ...inputStyle, marginBottom: SPACING.lg }}
        />

        <Pressable
          onPress={handleRegister}
          disabled={loading}
          style={{
            backgroundColor: COLORS.primary,
            padding: SPACING.md,
            borderRadius: 8,
            alignItems: "center",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={{
                color: "#fff",
                fontWeight: "bold",
                fontSize: FONT.normal,
              }}
            >
              REGISTER
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.push("/auth/login")}
          style={{
            marginTop: SPACING.lg,
            alignItems: "center",
            paddingBottom: SPACING.xl,
          }}
        >
          <Text style={{ color: COLORS.mutedText }}>
            Already have an account?{" "}
            <Text
              style={{ color: COLORS.primary, fontWeight: "bold" }}
            >
              Login
            </Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 8,
  padding: 12,
  marginBottom: 12,
  backgroundColor: "#fff",
};
