import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  Platform,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState, useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS, SPACING, FONT, STATUS_COLORS, API_URL } from "../../constants";

export default function MyOrders() {
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  useEffect(() => {
    const fetchLocalOrders = async () => {
      try {
        const AsyncStorage = require("@react-native-async-storage/async-storage").default;
        const existingOrdersText = await AsyncStorage.getItem("orders");
        const data = existingOrdersText ? JSON.parse(existingOrdersText) : [];
        setOrders(data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchLocalOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const orderDate = new Date(order.orderTime)
        .toISOString()
        .split("T")[0];
      return orderDate === selectedDate;
    });
  }, [orders, selectedDate]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ flex: 1, backgroundColor: COLORS.background, padding: SPACING.md }}>

        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: SPACING.md }}>
          <Pressable onPress={() => router.replace("/customer/home")}>
            <Ionicons name="arrow-back" size={24} />
          </Pressable>
          <Text style={{ fontSize: FONT.title, fontWeight: "bold", marginLeft: SPACING.sm }}>
            My Orders
          </Text>
        </View>

        {/* 📅 DATE FILTER (WEB SAFE) */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: COLORS.border,
            borderRadius: 8,
            paddingHorizontal: SPACING.md,
            marginBottom: SPACING.md,
            backgroundColor: COLORS.surface,
          }}
        >
          <TextInput
            value={selectedDate}
            onChangeText={setSelectedDate}
            style={{ flex: 1, height: 44 }}
            placeholder="YYYY-MM-DD"
            {...(Platform.OS === "web" && { type: "date" })}
          />
          <Ionicons name="calendar-outline" size={20} />
        </View>

        {/* ORDERS */}
        {filteredOrders.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: SPACING.lg }}>
            No orders for this date 📭
          </Text>
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={item => item.orderNo.toString()}
            renderItem={({ item }) => (
              <View
                style={{
                  backgroundColor: COLORS.surface,
                  padding: SPACING.md,
                  marginBottom: SPACING.md,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                }}
              >
                <Text style={{ fontWeight: "bold" }}>
                  Order #{item.orderNo}
                </Text>

                <Text>{new Date(item.orderTime).toLocaleString()}</Text>

                <Text>
                  Status:{" "}
                  <Text style={{ color: STATUS_COLORS[item.status] }}>
                    {item.status}
                  </Text>
                </Text>

                {item.items.map((i, idx) => (
                  <Text key={idx}>
                    {i.name} × {i.qty}
                  </Text>
                ))}
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
