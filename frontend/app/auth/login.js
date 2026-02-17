import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { COLORS, SPACING, FONT } from "../../constants";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // 🔐 Step 1: Login user
      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

      if (authError) {
        setError(authError.message);
        return;
      }

      const user = data.user;

      if (!user) {
        setError("Login failed");
        return;
      }

      // 🔥 Step 2: Get role from profiles table
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        setError("Profile not found");
        return;
      }

      // 🔥 Step 3: Role-based navigation
      if (profile.role === "chef") {
        router.replace("/chef/chefscreen");
      } else if (profile.role === "customer") {
        router.replace("/customer/home");
      } else {
        setError("Access denied");
      }

    } catch (err) {
      console.log("Login error:", err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: SPACING.lg,
        backgroundColor: COLORS.background,
      }}
    >
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
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text
            style={{
              color: "#fff",
              fontSize: FONT.normal,
              fontWeight: "bold",
            }}
          >
            LOGIN
          </Text>
        )}
      </Pressable>

      <Pressable
        onPress={() => router.push("/auth/register")}
        style={{ marginTop: SPACING.lg, alignItems: "center" }}
      >
        <Text style={{ color: COLORS.mutedText }}>
          Don't have an account?{" "}
          <Text
            style={{ color: COLORS.primary, fontWeight: "bold" }}
          >
            Register
          </Text>
        </Text>
      </Pressable>
    </View>
  );
}
