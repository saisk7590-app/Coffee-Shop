import { View, Text, FlatList, ActivityIndicator, Pressable, Platform, TextInput } from "react-native";
import { useEffect, useState, useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS, STATUS_COLORS, API_URL } from "../../constants";
import { useResponsive } from "../../lib/responsive";

export default function MyOrders() {
  const responsive = useResponsive();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  useEffect(() => {
    fetch(`${API_URL}/orders`, { headers: { "Bypass-Tunnel-Reminder": "true" } })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => new Date(order.orderTime).toISOString().split("T")[0] === selectedDate),
    [orders, selectedDate]
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const itemWidth = responsive.isMobile ? responsive.innerWidth : responsive.cardWidth;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <FlatList
        key={responsive.numColumns}
        data={filteredOrders}
        numColumns={responsive.numColumns}
        columnWrapperStyle={responsive.numColumns > 1 ? { justifyContent: "space-between", gap: responsive.gap } : null}
        keyExtractor={(item) => item.orderNo.toString()}
        contentContainerStyle={{ padding: responsive.screenPadding }}
        ListHeaderComponent={
          <View style={{ width: responsive.contentWidth, marginBottom: responsive.gap }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: responsive.gap }}>
              <Pressable onPress={() => router.replace("/customer/home")}>
                <Ionicons name="arrow-back" size={responsive.iconSize} color={COLORS.primary} />
              </Pressable>
              <Text style={{ fontSize: responsive.titleSize, fontWeight: "bold", marginLeft: 12 }}>My Orders</Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 16, marginBottom: responsive.gap, backgroundColor: COLORS.surface }}>
              <TextInput
                value={selectedDate}
                onChangeText={setSelectedDate}
                style={{ flex: 1, height: responsive.buttonHeight, fontSize: responsive.bodySize }}
                placeholder="YYYY-MM-DD"
                {...(Platform.OS === "web" && { type: "date" })}
              />
              <Ionicons name="calendar-outline" size={responsive.iconSize - 2} color={COLORS.primary} />
            </View>
          </View>
        }
        renderItem={({ item, index }) => {
          const isLeftOverSingle = responsive.numColumns === 2 && filteredOrders.length % 2 === 1 && index === filteredOrders.length - 1;
          const width = isLeftOverSingle ? responsive.contentWidth : itemWidth;

          return (
            <View style={{ width, marginBottom: responsive.gap }}>
              <View style={{ backgroundColor: COLORS.surface, padding: responsive.gap, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border }}>
                <Text style={{ fontWeight: "bold", fontSize: responsive.bodySize }}>Order #{item.orderNo}</Text>
                <Text style={{ color: COLORS.mutedText, marginTop: 4, fontSize: responsive.smallSize }}>{new Date(item.orderTime).toLocaleString()}</Text>
                <Text style={{ marginTop: 6, fontSize: responsive.bodySize }}>
                  Status: <Text style={{ color: STATUS_COLORS[item.status], fontWeight: "700" }}>{item.status}</Text>
                </Text>
                <View style={{ marginTop: 8 }}>
                  {item.items.map((i, idx) => (
                    <Text key={idx} style={{ color: COLORS.text, fontSize: responsive.smallSize }}>
                      {i.name} x {i.qty}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={{ textAlign: "center", color: COLORS.mutedText }}>No orders for this date.</Text>}
      />
    </View>
  );
}
