import { View, Text, TextInput, Pressable, Alert, ScrollView } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, API_URL } from "../../constants";
import { useResponsive } from "../../lib/responsive";

export default function Register() {
  const responsive = useResponsive();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Bypass-Tunnel-Reminder": "true",
        },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Registration failed", data.message || "Try again");
        return;
      }

      Alert.alert("Success", "Account created successfully");
      router.replace("/auth/login");
    } catch (err) {
      console.log("Register error:", err);
      Alert.alert("Error", "Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: responsive.gap,
    backgroundColor: "#fff",
    fontSize: responsive.bodySize,
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", backgroundColor: COLORS.background }}>
      <View style={{ padding: responsive.screenPadding }}>
        <View style={{ width: responsive.isLarge ? 560 : responsive.contentWidth, alignSelf: "center" }}>
          <Text style={{ fontSize: responsive.titleSize, fontWeight: "bold", textAlign: "center", marginBottom: responsive.gap }}>
            Create Account
          </Text>

          <TextInput placeholder="Name" value={name} onChangeText={setName} style={inputStyle} />
          <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={inputStyle} />
          <TextInput placeholder="Phone" keyboardType="phone-pad" value={phone} onChangeText={setPhone} style={inputStyle} />

          <View style={{ ...inputStyle, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 0 }}>
            <TextInput placeholder="Password" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} style={{ flex: 1, paddingVertical: 14, fontSize: responsive.bodySize }} />
            <Pressable onPress={() => setShowPassword((value) => !value)}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={responsive.iconSize} color={COLORS.mutedText} />
            </Pressable>
          </View>

          <View style={{ ...inputStyle, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 0 }}>
            <TextInput placeholder="Confirm Password" secureTextEntry={!showConfirmPassword} value={confirmPassword} onChangeText={setConfirmPassword} style={{ flex: 1, paddingVertical: 14, fontSize: responsive.bodySize }} />
            <Pressable onPress={() => setShowConfirmPassword((value) => !value)}>
              <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={responsive.iconSize} color={COLORS.mutedText} />
            </Pressable>
          </View>

          <Pressable onPress={handleRegister} disabled={loading} style={{ backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 10, alignItems: "center", opacity: loading ? 0.6 : 1 }}>
            <Text style={{ color: COLORS.buttonText, fontSize: responsive.bodySize, fontWeight: "bold" }}>
              {loading ? "Creating..." : "REGISTER"}
            </Text>
          </Pressable>

          <Pressable onPress={() => router.replace("/auth/login")} style={{ marginTop: responsive.gap }}>
            <Text style={{ textAlign: "center", color: COLORS.primary, fontSize: responsive.bodySize }}>
              Already have an account? Login
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
