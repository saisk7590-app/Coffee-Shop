import { View, Text, Pressable, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { COLORS, SPACING, FONT } from "../../constants";

export default function Bill() {
  const router = useRouter();
  const { cart: cartParam } = useLocalSearchParams();

  const [cartItems, setCartItems] = useState(
    cartParam
      ? Object.values(JSON.parse(cartParam)).filter(i => i.qty > 0)
      : []
  );

  const [paymentMode, setPaymentMode] = useState("Cash");

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const total = cartItems.reduce((sum, i) => sum + i.qty * i.price, 0);

  // ✅ CORRECT PLACE ORDER
  const placeOrder = async () => {
    if (cartItems.length === 0) {
      alert("Cart is empty!");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Get next order number
      const { data: lastOrder } = await supabase
        .from("orders")
        .select("order_no")
        .order("order_no", { ascending: false })
        .limit(1)
        .single();

      const nextOrderNo = (lastOrder?.order_no || 0) + 1;

      // 1️⃣ Insert into orders table
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_no: nextOrderNo,
          user_id: user?.id,
          payment_mode: paymentMode,
          status: "Pending",
          total: total,
          order_time: new Date(),
        })
        .select()
        .single();

      if (orderError) {
        alert("Order failed: " + orderError.message);
        return;
      }

      // 2️⃣ Insert into order_items table
      const orderItemsData = cartItems.map(item => ({
        order_id: orderData.id,
        item_id: item.id,
        quantity: item.qty,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsData);

      if (itemsError) {
        alert("Order items failed: " + itemsError.message);
        return;
      }

      // Success
      router.replace({
        pathname: "/customer/home",
        params: {
          successMessage: `✅ Order #${orderData.order_no} placed successfully`,
        },
      });

    } catch (err) {
      console.log("Order error:", err);
      alert("Something went wrong.");
    }
  };

  const addMore = () => {
    router.push({
      pathname: "/customer/menu",
      params: { cart: JSON.stringify(cartItems) },
    });
  };

  const cancelOrder = () => {
    setCartItems([]);
    router.replace("/customer/menu");
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      
      <View
        style={{
          padding: SPACING.md,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottomWidth: 1,
          borderColor: COLORS.border,
        }}
      >
        <Pressable onPress={addMore}>
          <Text style={{ color: COLORS.primary }}>⬅ Add More</Text>
        </Pressable>

        <Text style={{ fontSize: FONT.subtitle, fontWeight: "bold" }}>
          Bill
        </Text>

        <View style={{ width: 80 }} />
      </View>

      <View style={{ padding: SPACING.md }}>

        <Text style={{ marginBottom: SPACING.md }}>
          {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
        </Text>

        {cartItems.map(i => (
          <View
            key={i.id}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: SPACING.sm,
            }}
          >
            <Text>
              {i.name} × {i.qty}
            </Text>
            <Text style={{ color: COLORS.primary }}>
              ₹{(i.qty * i.price).toFixed(2)}
            </Text>
          </View>
        ))}

        <View
          style={{
            borderTopWidth: 1,
            borderColor: COLORS.border,
            marginTop: SPACING.md,
            paddingTop: SPACING.md,
          }}
        >
          <Text style={{ fontSize: FONT.subtitle, fontWeight: "bold" }}>
            Total: ₹{total.toFixed(2)}
          </Text>
        </View>

        <View style={{ flexDirection: "row", marginTop: SPACING.md }}>
          {["Cash", "Online"].map(mode => (
            <Pressable
              key={mode}
              onPress={() => setPaymentMode(mode)}
              style={{
                padding: SPACING.sm,
                marginRight: SPACING.md,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: COLORS.border,
                backgroundColor:
                  paymentMode === mode ? COLORS.primary : "#fff",
              }}
            >
              <Text
                style={{
                  color:
                    paymentMode === mode
                      ? COLORS.buttonText
                      : COLORS.text,
                }}
              >
                {mode}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={{ flexDirection: "row", marginTop: SPACING.lg }}>
          <Pressable
            onPress={cancelOrder}
            style={{
              flex: 1,
              backgroundColor: "#FF4D4D",
              padding: SPACING.md,
              borderRadius: 8,
              marginRight: SPACING.md,
            }}
          >
            <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>
              Cancel Order
            </Text>
          </Pressable>

          <Pressable
            onPress={placeOrder}
            style={{
              flex: 1,
              backgroundColor: COLORS.primary,
              padding: SPACING.md,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>
              CONFIRM ORDER
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
