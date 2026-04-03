import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  Modal,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { COLORS, API_URL } from "../../constants";
import { clearAuthSession, getAuthRole, getAuthToken } from "../../lib/auth";
import { useResponsive } from "../../lib/responsive";

const roleLabelMap = {
  customer: "Customer",
  chef: "Chef",
  admin: "Admin",
};

export default function Profile() {
  const responsive = useResponsive();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      const storedRole = await getAuthRole();

      if (!token) {
        router.replace("/auth/login");
        return;
      }

      const response = await fetch(`${API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Bypass-Tunnel-Reminder": "true",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        Alert.alert("Error", data.message || "Failed to load profile");
        return;
      }

      setName(data.name || "");
      setPhone(data.phone || "");
      setEmail(data.email || "");
      setRole(roleLabelMap[data.role] || roleLabelMap[storedRole] || "User");
    } catch (error) {
      console.log("Profile load error:", error);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const saveProfile = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("Error", "Name and phone cannot be empty");
      return;
    }

    try {
      setSaving(true);
      const token = await getAuthToken();
      const response = await fetch(`${API_URL}/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Bypass-Tunnel-Reminder": "true",
        },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        Alert.alert("Error", data.message || "Failed to update profile");
        return;
      }

      Alert.alert("Success", "Profile updated successfully");
      await loadProfile();
    } catch (error) {
      console.log("Profile save error:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_URL}/change-password`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Bypass-Tunnel-Reminder": "true",
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        Alert.alert("Error", data.message || "Failed to update password");
        return;
      }

      Alert.alert("Success", "Password updated");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordModal(false);
    } catch (error) {
      console.log("Password update error:", error);
      Alert.alert("Error", "Failed to update password");
    }
  };

  const logout = async () => {
    await clearAuthSession();
    router.replace("/auth/login");
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

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
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ padding: responsive.screenPadding }}>
        <View style={{ width: responsive.contentWidth }}>
          <Text style={{ fontSize: responsive.titleSize, fontWeight: "bold", marginBottom: responsive.gap }}>
            Profile
          </Text>

          <View style={{ backgroundColor: "#fff", padding: responsive.gap, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border }}>
            <View style={{ gap: responsive.gap }}>
              <View>
                <Text style={{ fontSize: responsive.bodySize, fontWeight: "700", marginBottom: 6 }}>Name</Text>
                <TextInput value={name} onChangeText={setName} style={inputStyle} />
              </View>
              <View>
                <Text style={{ fontSize: responsive.bodySize, fontWeight: "700", marginBottom: 6 }}>Phone</Text>
                <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={inputStyle} />
              </View>
              <View>
                <Text style={{ fontSize: responsive.bodySize, fontWeight: "700", marginBottom: 6 }}>Email</Text>
                <Text style={{ ...inputStyle, backgroundColor: "#f5f5f5" }}>{email}</Text>
              </View>
              <View>
                <Text style={{ fontSize: responsive.bodySize, fontWeight: "700", marginBottom: 6 }}>Role</Text>
                <Text style={{ ...inputStyle, backgroundColor: "#f5f5f5" }}>{role}</Text>
              </View>
            </View>

            <Text style={{ fontSize: responsive.bodySize, fontWeight: "700", marginBottom: 6 }}>Password</Text>
            <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 14, backgroundColor: "#f5f5f5", marginBottom: responsive.gap }}>
              <Text style={{ flex: 1, fontSize: responsive.bodySize }}>********</Text>
              <Pressable onPress={() => setShowPasswordModal(true)}>
                <Text style={{ fontSize: responsive.bodySize, color: COLORS.primary, fontWeight: "bold" }}>Edit</Text>
              </Pressable>
            </View>
          </View>

          <View style={{ flexDirection: "column", gap: responsive.gap, marginTop: responsive.gap }}>
            <Pressable
              onPress={saveProfile}
              disabled={saving}
              style={{ backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 10, alignItems: "center", opacity: saving ? 0.6 : 1 }}
            >
              <Text style={{ color: COLORS.buttonText, fontWeight: "bold", fontSize: responsive.bodySize }}>
                {saving ? "SAVING..." : "SAVE CHANGES"}
              </Text>
            </Pressable>

            <Pressable onPress={logout} style={{ borderWidth: 1, borderColor: COLORS.primary, paddingVertical: 14, borderRadius: 10, alignItems: "center" }}>
              <Text style={{ color: COLORS.primary, fontWeight: "bold", fontSize: responsive.bodySize }}>LOGOUT</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <Modal transparent visible={showPasswordModal} animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: responsive.screenPadding }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 14, padding: responsive.gap }}>
            <Text style={{ fontSize: responsive.subtitleSize, fontWeight: "bold", marginBottom: responsive.gap }}>
              Change Password
            </Text>
            <TextInput placeholder="Old Password" secureTextEntry value={oldPassword} onChangeText={setOldPassword} style={inputStyle} />
            <TextInput placeholder="New Password" secureTextEntry value={newPassword} onChangeText={setNewPassword} style={inputStyle} />
            <TextInput placeholder="Confirm Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} style={inputStyle} />

            <Pressable onPress={updatePassword} style={{ backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 10, alignItems: "center" }}>
              <Text style={{ color: COLORS.buttonText, fontWeight: "bold", fontSize: responsive.bodySize }}>UPDATE PASSWORD</Text>
            </Pressable>
            <Pressable onPress={() => setShowPasswordModal(false)} style={{ marginTop: 12, alignItems: "center" }}>
              <Text style={{ color: COLORS.primary, fontSize: responsive.bodySize }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
