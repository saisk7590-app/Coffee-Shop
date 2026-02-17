import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { COLORS, SPACING, FONT } from "../../constants";

export default function Profile() {
  const router = useRouter();

  const [userId, setUserId] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("customer");
  const [loading, setLoading] = useState(true);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 🔥 FETCH PROFILE
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          throw error;
        }

        setUserId(user.id);
        setEmail(user.email);

        // Try to get profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle(); // ✅ safer than single()

        // If no profile exists → create one automatically
        if (!profile) {
          const { error: insertError } = await supabase
            .from("profiles")
            .insert([
              {
                id: user.id,
                name: user.user_metadata?.name || "",
                phone: user.user_metadata?.phone || "",
                role: user.user_metadata?.role || "customer",
              },
            ]);

          if (insertError) throw insertError;

          setName(user.user_metadata?.name || "");
          setPhone(user.user_metadata?.phone || "");
          setRole(user.user_metadata?.role || "customer");
        } else {
          setName(profile.name || "");
          setPhone(profile.phone || "");
          setRole(profile.role || "customer");
        }

      } catch (err) {
        console.log("Fetch profile error:", err);
        Alert.alert("Error", "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ✅ UPDATE PROFILE
  const saveProfile = async () => {
    if (!name || !phone) {
      Alert.alert("Error", "Name and phone cannot be empty");
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ name, phone })
        .eq("id", userId);

      if (error) throw error;

      Alert.alert("Success", "Profile updated successfully");
    } catch (err) {
      console.log("Update profile error:", err);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  // 🔐 UPDATE PASSWORD
  const updatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      Alert.alert("Success", "Password updated");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordModal(false);
    } catch (err) {
      console.log("Update password error:", err);
      Alert.alert("Error", "Failed to update password");
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/auth/login");
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg }}>
      <Text style={{ fontSize: FONT.title, fontWeight: "bold", marginBottom: SPACING.lg }}>
        Profile
      </Text>

      <View
        style={{
          backgroundColor: "#fff",
          padding: SPACING.lg,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: COLORS.border,
        }}
      >
        <Text>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={inputStyle}
        />

        <Text>Phone</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={inputStyle}
        />

        <Text>Email</Text>
        <Text style={readonlyStyle}>{email}</Text>

        <Text>Role</Text>
        <Text style={readonlyStyle}>{role}</Text>
      </View>

      <Pressable onPress={saveProfile} style={buttonStyle}>
        <Text style={buttonText}>SAVE CHANGES</Text>
      </Pressable>

      <Pressable
        onPress={() => setShowPasswordModal(true)}
        style={outlineButtonStyle}
      >
        <Text style={{ color: COLORS.primary, fontWeight: "bold" }}>
          CHANGE PASSWORD
        </Text>
      </Pressable>

      <Pressable onPress={logout} style={logoutStyle}>
        <Text style={{ color: "#FF4D4D", fontWeight: "bold" }}>
          LOGOUT
        </Text>
      </Pressable>

      {/* Password Modal */}
      <Modal transparent visible={showPasswordModal} animationType="fade">
        <View style={modalOverlay}>
          <View style={modalBox}>
            <Text style={{ fontWeight: "bold", marginBottom: 15 }}>
              Change Password
            </Text>

            <TextInput
              placeholder="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              style={inputStyle}
            />

            <TextInput
              placeholder="Confirm Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={inputStyle}
            />

            <Pressable onPress={updatePassword} style={buttonStyle}>
              <Text style={buttonText}>UPDATE PASSWORD</Text>
            </Pressable>

            <Pressable
              onPress={() => setShowPasswordModal(false)}
              style={{ marginTop: 10, alignItems: "center" }}
            >
              <Text style={{ color: COLORS.primary }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 8,
  padding: 12,
  marginBottom: 12,
};

const readonlyStyle = {
  padding: 12,
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 8,
  backgroundColor: "#f2f2f2",
  marginBottom: 12,
};

const buttonStyle = {
  marginTop: 20,
  backgroundColor: COLORS.primary,
  padding: 14,
  borderRadius: 8,
  alignItems: "center",
};

const outlineButtonStyle = {
  marginTop: 12,
  borderWidth: 1,
  borderColor: COLORS.primary,
  padding: 14,
  borderRadius: 8,
  alignItems: "center",
};

const logoutStyle = {
  marginTop: 12,
  borderWidth: 1,
  borderColor: "#FF4D4D",
  padding: 14,
  borderRadius: 8,
  alignItems: "center",
};

const buttonText = {
  color: "#fff",
  fontWeight: "bold",
};

const modalOverlay = {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "center",
  padding: 20,
};

const modalBox = {
  backgroundColor: "#fff",
  borderRadius: 12,
  padding: 20,
};
