import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { COLORS, SPACING, FONT, STATUS_COLORS } from "../../constants";

export default function Chef() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("recent");
  const [loading, setLoading] = useState(true);

  // ✅ Safe date format (local time automatically)
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

  // ✅ Get YYYY-MM-DD safely
  const formatDateOnly = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  // ✅ Fetch orders
  const fetchOrders = useCallback(async () => {
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
        .order("order_time", { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (err) {
      console.log("Fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let channel;

    const init = async () => {
      await fetchOrders();

      // ✅ Realtime subscription
      channel = supabase
        .channel("chef-orders")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "orders",
          },
          () => {
            fetchOrders();
          }
        )
        .subscribe();
    };

    init();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  // ✅ Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (!order.order_time) return false;

      const orderDate = formatDateOnly(order.order_time);

      if (activeTab === "recent") {
        return orderDate === today;
      }

      return orderDate === selectedDate;
    });
  }, [orders, activeTab, selectedDate]);

  const updateStatus = async (orderId, newStatus) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) console.log(error.message);
  };

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
        padding: SPACING.md,
        backgroundColor: COLORS.background,
      }}
    >
      <Text
        style={{
          fontSize: FONT.title,
          fontWeight: "bold",
          marginBottom: SPACING.md,
        }}
      >
        Chef Orders
      </Text>

      {/* TABS */}
      <View style={{ flexDirection: "row", marginBottom: SPACING.md }}>
        {["recent", "previous"].map((tab) => (
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

      {/* DATE PICKER */}
      {activeTab === "previous" && (
        <View
          style={{
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
            style={{ height: 44 }}
            placeholder="YYYY-MM-DD"
            {...(Platform.OS === "web" && { type: "date" })}
          />
        </View>
      )}

      {/* ORDERS */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id.toString()}
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
              Order #{item.order_no}
            </Text>

            <Text>{formatDateTime(item.order_time)}</Text>

            <Text style={{ fontWeight: "bold", marginTop: 4 }}>
              Status:{" "}
              <Text style={{ color: STATUS_COLORS[item.status] || "#000" }}>
                {item.status}
              </Text>
            </Text>

            {item.order_items?.map((oi) => (
              <Text key={oi.id}>
                {oi.items?.name || "Item"} × {oi.quantity}
              </Text>
            ))}

            {activeTab === "recent" && item.status !== "Served" && (
              <View style={{ flexDirection: "row", marginTop: SPACING.sm }}>
                {item.status === "Pending" && (
                  <Pressable
                    onPress={() => updateStatus(item.id, "In Progress")}
                    style={{
                      backgroundColor: STATUS_COLORS["In Progress"],
                      padding: SPACING.sm,
                      borderRadius: 6,
                      marginRight: SPACING.sm,
                    }}
                  >
                    <Text style={{ color: "#fff" }}>Start</Text>
                  </Pressable>
                )}

                {item.status === "In Progress" && (
                  <Pressable
                    onPress={() => updateStatus(item.id, "Ready")}
                    style={{
                      backgroundColor: STATUS_COLORS["Ready"],
                      padding: SPACING.sm,
                      borderRadius: 6,
                      marginRight: SPACING.sm,
                    }}
                  >
                    <Text style={{ color: "#fff" }}>Ready</Text>
                  </Pressable>
                )}

                {item.status === "Ready" && (
                  <Pressable
                    onPress={() => updateStatus(item.id, "Served")}
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
  );
}
