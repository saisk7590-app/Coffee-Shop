import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  Platform,
  TextInput,
} from "react-native";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { COLORS, SPACING, FONT, STATUS_COLORS } from "../../constants";

export default function MyOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // ✅ Today's date (YYYY-MM-DD)
  const getTodayLocal = () => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  };

  const [selectedDate, setSelectedDate] = useState(getTodayLocal());

  // ✅ Format date/time safely
  const formatDateTime = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ✅ Fetch Orders
  const fetchOrders = useCallback(async (uid) => {
    if (!uid) return;

    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            id,
            quantity,
            price,
            items (
              name
            )
          )
        `)
        .eq("user_id", uid)
        .order("order_time", { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (err) {
      console.log("Fetch orders error:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let channel;

    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setUserId(user.id);
      await fetchOrders(user.id);

      // ✅ Realtime listener (only this user's orders)
      channel = supabase
        .channel("orders-realtime")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "orders",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchOrders(user.id);
          }
        )
        .subscribe();
    };

    init();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchOrders]);

  // ✅ Date filter
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (!order.order_time) return false;

      const orderDate = new Date(order.order_time)
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
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
        padding: SPACING.md,
      }}
    >
      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: SPACING.md,
        }}
      >
        <Pressable onPress={() => router.replace("/customer/home")}>
          <Ionicons name="arrow-back" size={24} />
        </Pressable>

        <Text
          style={{
            fontSize: FONT.title,
            fontWeight: "bold",
            marginLeft: SPACING.sm,
          }}
        >
          My Orders
        </Text>
      </View>

      {/* DATE FILTER */}
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

      {/* ORDERS LIST */}
      {filteredOrders.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: SPACING.lg }}>
          No orders for this date 📭
        </Text>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id.toString()}
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
                Order #{item.order_no}
              </Text>

              <Text>{formatDateTime(item.order_time)}</Text>

              <Text style={{ fontWeight: "bold" }}>
                Status:{" "}
                <Text
                  style={{
                    color: STATUS_COLORS[item.status] || "#000",
                  }}
                >
                  {item.status}
                </Text>
              </Text>

              {item.order_items?.map((oi) => (
                <Text key={oi.id}>
                  {oi.items?.name || "Item"} × {oi.quantity}
                </Text>
              ))}

              <Text style={{ marginTop: 6, fontWeight: "bold" }}>
                Total: ₹{Number(item.total || 0).toFixed(2)}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
