import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, API_URL } from "../../constants";
import { saveAuthSession } from "../../lib/auth";
import { useResponsive } from "../../lib/responsive";

export default function Login() {
  const responsive = useResponsive();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Bypass-Tunnel-Reminder": "true",
        },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const text = await res.text();
      const contentType = res.headers.get("content-type") || "";
      let data = null;

      if (contentType.includes("application/json")) {
        data = JSON.parse(text);
      } else {
        setError(text.includes("ERR_NGROK_8012") ? "Backend is not running on port 5000" : "Server error. Please check backend and ngrok.");
        return;
      }

      if (!res.ok) {
        setError(data?.message || "Invalid login credentials");
        return;
      }

      await saveAuthSession({ token: data.token, role: data.role });
      if (data.role === "customer") router.replace("/customer/home");
      else if (data.role === "chef") router.replace("/chef/chefscreen");
      else if (data.role === "admin") router.replace("/admin/dashboard");
      else setError("Access denied");
    } catch (err) {
      console.log("Login error:", err);
      setError("Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", backgroundColor: COLORS.background }}>
      <View style={{ padding: responsive.screenPadding }}>
        <View style={{ width: responsive.isLarge ? 420 : responsive.isTablet ? 480 : responsive.contentWidth, alignSelf: "center" }}>
          <Text style={{ fontSize: responsive.titleSize, fontWeight: "bold", textAlign: "center", marginBottom: responsive.gap }}>
            Cafe Login
          </Text>

          {error ? <Text style={{ color: "red", textAlign: "center", marginBottom: responsive.gap / 1.5, fontSize: responsive.bodySize }}>{error}</Text> : null}

          <TextInput
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 14, marginBottom: responsive.gap / 1.5, backgroundColor: "#fff", fontSize: responsive.bodySize }}
          />

          <View style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, marginBottom: responsive.gap, backgroundColor: "#fff", flexDirection: "row", alignItems: "center", paddingHorizontal: 14 }}>
            <TextInput
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              style={{ flex: 1, paddingVertical: 14, fontSize: responsive.bodySize }}
            />
            <Pressable onPress={() => setShowPassword((value) => !value)}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={responsive.iconSize} color={COLORS.mutedText} />
            </Pressable>
          </View>

          <Pressable onPress={handleLogin} disabled={loading} style={{ backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 10, alignItems: "center", opacity: loading ? 0.6 : 1 }}>
            <Text style={{ color: "#fff", fontSize: responsive.bodySize, fontWeight: "bold" }}>
              {loading ? "Logging in..." : "LOGIN"}
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
