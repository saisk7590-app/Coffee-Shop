import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import { COLORS, SPACING, FONT } from "../../constants";

export default function Profile() {
  const router = useRouter();

  // Demo user data (later from backend)
  const [name, setName] = useState("Customer Name");
  const [phone, setPhone] = useState("9876543210");

  const email = "customer@gmail.com";
  const role = "Customer";

  // Password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const saveProfile = () => {
    if (!name || !phone) {
      Alert.alert("Error", "Name and phone cannot be empty");
      return;
    }
    Alert.alert("Success", "Profile updated successfully");
  };

  const updatePassword = () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    // later → backend API call
    Alert.alert("Success", "Password updated");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordModal(false);
  };

  const logout = () => {
    router.replace("/auth/login");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg }}>
        {/* TITLE */}
        <Text style={{ fontSize: FONT.title, fontWeight: "bold", marginBottom: SPACING.lg }}>
          Profile
        </Text>

        {/* PROFILE CARD */}
        <View
          style={{
            backgroundColor: "#fff",
            padding: SPACING.lg,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: COLORS.border,
          }}
        >
          {/* NAME */}
          <Text style={{ fontSize: FONT.subtitle }}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={{
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: 8,
              padding: SPACING.md,
              marginBottom: SPACING.md,
            }}
          />

          {/* PHONE */}
          <Text style={{ fontSize: FONT.subtitle }}>Phone</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={{
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: 8,
              padding: SPACING.md,
              marginBottom: SPACING.md,
            }}
          />

          {/* EMAIL */}
          <Text style={{ fontSize: FONT.subtitle }}>Email</Text>
          <Text
            style={{
              padding: SPACING.md,
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: 8,
              backgroundColor: "#f5f5f5",
              marginBottom: SPACING.md,
            }}
          >
            {email}
          </Text>

          {/* PASSWORD ROW */}
          <Text style={{ fontSize: FONT.subtitle }}>Password</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: 8,
              padding: SPACING.md,
              backgroundColor: "#f5f5f5",
            }}
          >
            <Text style={{ flex: 1 }}>********</Text>
            <Pressable onPress={() => setShowPasswordModal(true)}>
              <Text style={{ fontSize: 18 }}>✏️</Text>
            </Pressable>
          </View>

          {/* ROLE */}
          <Text style={{ fontSize: FONT.subtitle, marginTop: SPACING.md }}>
            Role
          </Text>
          <Text
            style={{
              padding: SPACING.md,
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: 8,
              backgroundColor: "#f5f5f5",
            }}
          >
            {role}
          </Text>
        </View>

        {/* SAVE */}
        <Pressable
          onPress={saveProfile}
          style={{
            marginTop: SPACING.lg,
            backgroundColor: COLORS.primary,
            padding: SPACING.md,
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ color: COLORS.buttonText, fontWeight: "bold" }}>
            SAVE CHANGES
          </Text>
        </Pressable>

        {/* LOGOUT */}
        <Pressable
          onPress={logout}
          style={{
            marginTop: SPACING.md,
            borderWidth: 1,
            borderColor: COLORS.primary,
            padding: SPACING.md,
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ color: COLORS.primary, fontWeight: "bold" }}>
            LOGOUT
          </Text>
        </Pressable>

        {/* 🔐 CHANGE PASSWORD MODAL */}
        <Modal transparent visible={showPasswordModal} animationType="fade">
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              padding: SPACING.lg,
            }}
          >
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: SPACING.lg,
              }}
            >
              <Text style={{ fontSize: FONT.subtitle, fontWeight: "bold", marginBottom: SPACING.md }}>
                Change Password
              </Text>

              <TextInput
                placeholder="New Password"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  borderRadius: 8,
                  padding: SPACING.md,
                  marginBottom: SPACING.md,
                }}
              />

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
                }}
              />

              <Pressable
                onPress={updatePassword}
                style={{
                  backgroundColor: COLORS.primary,
                  padding: SPACING.md,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: COLORS.buttonText, fontWeight: "bold" }}>
                  UPDATE PASSWORD
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setShowPasswordModal(false)}
                style={{ marginTop: SPACING.sm, alignItems: "center" }}
              >
                <Text style={{ color: COLORS.primary }}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
