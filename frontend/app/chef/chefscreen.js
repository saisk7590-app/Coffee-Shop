import { View, Text, FlatList, Pressable, TextInput, Platform } from "react-native";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, STATUS_COLORS, API_URL } from "../../constants";
import { useResponsive } from "../../lib/responsive";

export default function Chef() {
  const responsive = useResponsive();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("recent");
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`, { headers: { "Bypass-Tunnel-Reminder": "true" } });
      setOrders(await res.json());
    } catch (err) {
      console.log("Fetch orders error:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (orderNo, newStatus) => {
    try {
      await fetch(`${API_URL}/orders/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Bypass-Tunnel-Reminder": "true",
        },
        body: JSON.stringify({ orderNo, status: newStatus }),
      });
      fetchOrders();
    } catch (err) {
      console.log("Update status error:", err);
    }
  };

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const orderDate = new Date(order.orderTime).toISOString().split("T")[0];
        return activeTab === "recent" ? orderDate === today : orderDate === selectedDate;
      }),
    [orders, activeTab, selectedDate, today]
  );

  const itemWidth = responsive.isMobile ? responsive.innerWidth : responsive.cardWidth;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <FlatList
        key={`${activeTab}-${responsive.numColumns}`}
        data={filteredOrders}
        numColumns={responsive.numColumns}
        columnWrapperStyle={responsive.numColumns > 1 ? { justifyContent: "space-between", gap: responsive.gap } : null}
        keyExtractor={(item) => item.orderNo.toString()}
        contentContainerStyle={{ padding: responsive.screenPadding }}
        ListHeaderComponent={
          <View style={{ width: responsive.contentWidth, marginBottom: responsive.gap }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: responsive.gap }}>
              <Text style={{ fontSize: responsive.titleSize, fontWeight: "bold" }}>Chef Orders</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Pressable onPress={() => router.push("/customer/profile")} style={{ marginRight: 16 }}>
                  <Ionicons name="person-circle-outline" size={responsive.iconSize + 2} color={COLORS.primary} />
                </Pressable>
                <Pressable onPress={() => router.replace("/auth/login")}>
                  <Ionicons name="log-out-outline" size={responsive.iconSize} color={COLORS.primary} />
                </Pressable>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: responsive.gap / 2, marginBottom: responsive.gap }}>
              {["recent", "previous"].map((tab) => (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    paddingVertical: responsive.buttonHeight / 4,
                    backgroundColor: activeTab === tab ? COLORS.primary : COLORS.surface,
                    borderRadius: 10,
                    borderWidth: activeTab === tab ? 0 : 1,
                    borderColor: COLORS.border,
                  }}
                >
                  <Text style={{ textAlign: "center", color: activeTab === tab ? "#fff" : COLORS.text, fontWeight: "bold", fontSize: responsive.bodySize }}>
                    {tab === "recent" ? "Recent Orders" : "Previous Orders"}
                  </Text>
                </Pressable>
              ))}
            </View>

            {activeTab === "previous" ? (
              <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 16, marginBottom: responsive.gap, backgroundColor: COLORS.surface }}>
                <TextInput
                  value={selectedDate}
                  onChangeText={setSelectedDate}
                  style={{ flex: 1, height: responsive.buttonHeight, fontSize: responsive.bodySize }}
                  {...(Platform.OS === "web" && { type: "date" })}
                />
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item, index }) => {
          const isLeftOverSingle = responsive.numColumns === 2 && filteredOrders.length % 2 === 1 && index === filteredOrders.length - 1;
          const width = isLeftOverSingle ? responsive.contentWidth : itemWidth;

          return (
            <View style={{ width, marginBottom: responsive.gap }}>
              <View style={{ padding: responsive.isAndroidPhone ? 10 : responsive.gap, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, backgroundColor: "#fff" }}>
                <Text style={{ fontWeight: "bold", fontSize: responsive.bodySize }}>Order #{item.orderNo}</Text>
                <Text style={{ color: COLORS.mutedText, marginTop: 4, fontSize: responsive.smallSize }}>{new Date(item.orderTime).toLocaleString()}</Text>
                <Text style={{ fontWeight: "bold", fontSize: responsive.bodySize, marginTop: 6 }}>
                  Status: <Text style={{ color: STATUS_COLORS[item.status] }}>{item.status}</Text>
                </Text>
                <View style={{ marginTop: 8 }}>
                  {item.items.map((i, idx) => (
                    <Text key={idx} style={{ fontSize: responsive.smallSize }}>{i.name} x {i.qty}</Text>
                  ))}
                </View>

                {activeTab === "recent" && item.status !== "Served" ? (
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: responsive.gap / 1.5 }}>
                    {item.status === "Pending" ? (
                      <Pressable onPress={() => updateStatus(item.orderNo, "In Progress")} style={{ backgroundColor: STATUS_COLORS["In Progress"], paddingVertical: responsive.buttonHeight / 4, paddingHorizontal: 18, borderRadius: 10 }}>
                        <Text style={{ color: "#fff", fontSize: responsive.bodySize, fontWeight: "700" }}>Start</Text>
                      </Pressable>
                    ) : null}
                    {item.status === "In Progress" ? (
                      <Pressable onPress={() => updateStatus(item.orderNo, "Ready")} style={{ backgroundColor: STATUS_COLORS.Ready, paddingVertical: responsive.buttonHeight / 4, paddingHorizontal: 18, borderRadius: 10 }}>
                        <Text style={{ color: "#fff", fontSize: responsive.bodySize, fontWeight: "700" }}>Ready</Text>
                      </Pressable>
                    ) : null}
                    {item.status === "Ready" ? (
                      <Pressable onPress={() => updateStatus(item.orderNo, "Served")} style={{ backgroundColor: STATUS_COLORS.Served, paddingVertical: responsive.buttonHeight / 4, paddingHorizontal: 18, borderRadius: 10 }}>
                        <Text style={{ color: "#fff", fontSize: responsive.bodySize, fontWeight: "700" }}>Serve</Text>
                      </Pressable>
                    ) : null}
                  </View>
                ) : null}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={{ textAlign: "center", color: COLORS.mutedText }}>No orders found</Text>}
      />
    </View>
  );
}
