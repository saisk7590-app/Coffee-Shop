import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState, useMemo } from "react";
import { COLORS, SPACING, FONT, STATUS_COLORS, API_URL } from "../../constants";

export default function Chef() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("recent"); // recent | previous

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  // Fetch orders (MOCKED)
  const fetchOrders = async () => {
    try {
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      const existingOrdersText = await AsyncStorage.getItem("orders");
      const data = existingOrdersText ? JSON.parse(existingOrdersText) : [];
      setOrders(data);
    } catch (err) {
      console.log("Fetch orders error:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  // Status update (MOCKED)
  const updateStatus = async (orderNo, newStatus) => {
    try {
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      const existingOrdersText = await AsyncStorage.getItem("orders");
      let orders = existingOrdersText ? JSON.parse(existingOrdersText) : [];

      orders = orders.map(o => o.orderNo === orderNo ? { ...o, status: newStatus } : o);

      await AsyncStorage.setItem("orders", JSON.stringify(orders));
      fetchOrders();
    } catch (err) {
      console.log("Update status error:", err);
    }
  };

  // 🔍 FILTER LOGIC
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const orderDate = new Date(order.orderTime)
        .toISOString()
        .split("T")[0];

      if (activeTab === "recent") {
        return orderDate === today;
      }

      return orderDate === selectedDate;
    });
  }, [orders, activeTab, selectedDate]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ flex: 1, padding: SPACING.md, backgroundColor: COLORS.background }}>
        {/* TITLE */}
        <Text style={{ fontSize: FONT.title, fontWeight: "bold", marginBottom: SPACING.md }}>
          Chef Orders
        </Text>

        {/* 🔘 TABS */}
        <View style={{ flexDirection: "row", marginBottom: SPACING.md }}>
          {["recent", "previous"].map(tab => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: SPACING.sm,
                backgroundColor:
                  activeTab === tab ? COLORS.primary : COLORS.surface,
                borderRadius: 6,
                marginRight: tab === "recent" ? SPACING.sm : 0,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: activeTab === tab ? "#fff" : COLORS.text,
                  fontWeight: "bold",
                }}
              >
                {tab === "recent" ? "Recent Orders" : "Previous Orders"}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* 📅 DATE FILTER (ONLY FOR PREVIOUS) */}
        {activeTab === "previous" && (
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
              {...(Platform.OS === "web" && { type: "date" })}
            />
          </View>
        )}

        {/* 📦 ORDERS LIST */}
        <FlatList
          data={filteredOrders}
          keyExtractor={item => item.orderNo.toString()}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: SPACING.lg }}>
              No orders found 📭
            </Text>
          }
          renderItem={({ item }) => (
            <View
              style={{
                marginBottom: SPACING.md,
                padding: SPACING.md,
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: 8,
                backgroundColor: "#fff",
              }}
            >
              <Text style={{ fontWeight: "bold" }}>
                Order #{item.orderNo}
              </Text>

              <Text>{new Date(item.orderTime).toLocaleString()}</Text>

              <Text style={{ fontWeight: "bold" }}>
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

              {/* 👨‍🍳 ACTIONS ONLY FOR RECENT */}
              {activeTab === "recent" && item.status !== "Served" && (
                <View style={{ flexDirection: "row", marginTop: SPACING.sm, gap: SPACING.sm }}>
                  {item.status === "Pending" && (
                    <Pressable
                      onPress={() => updateStatus(item.orderNo, "In Progress")}
                      style={{
                        backgroundColor: STATUS_COLORS["In Progress"],
                        padding: SPACING.sm,
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ color: "#fff" }}>Start</Text>
                    </Pressable>
                  )}

                  {item.status === "In Progress" && (
                    <Pressable
                      onPress={() => updateStatus(item.orderNo, "Ready")}
                      style={{
                        backgroundColor: STATUS_COLORS["Ready"],
                        padding: SPACING.sm,
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ color: "#fff" }}>Ready</Text>
                    </Pressable>
                  )}

                  {item.status === "Ready" && (
                    <Pressable
                      onPress={() => updateStatus(item.orderNo, "Served")}
                      style={{
                        backgroundColor: STATUS_COLORS["Served"],
                        padding: SPACING.sm,
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ color: "#fff" }}>Serve</Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
