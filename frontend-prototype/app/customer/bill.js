import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { COLORS, SPACING, FONT, API_URL } from "../../constants";

export default function Bill() {
  const router = useRouter();
  const { cart: cartParam } = useLocalSearchParams();

  // Parse cart
  const [cartItems, setCartItems] = useState(
    cartParam
      ? Object.values(JSON.parse(cartParam)).filter(i => i.qty > 0)
      : []
  );

  const [paymentMode, setPaymentMode] = useState("Cash");

  // Live date & time
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const total = cartItems.reduce((sum, i) => sum + i.qty * i.price, 0);

  // ✅ PLACE ORDER (LOCAL PERSISTENCE)
  const placeOrder = async () => {
    if (cartItems.length === 0) {
      alert("Cart is empty!");
      return;
    }

    try {
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      const existingOrdersText = await AsyncStorage.getItem("orders");
      const orders = existingOrdersText ? JSON.parse(existingOrdersText) : [];

      const newOrderNo = orders.length > 0 ? orders[0].orderNo + 1 : 1001;
      const newOrder = {
        orderNo: newOrderNo,
        items: cartItems,
        paymentMode,
        status: "Pending",
        orderTime: new Date().toISOString()
      };

      await AsyncStorage.setItem("orders", JSON.stringify([newOrder, ...orders]));

      // ✅ Navigate to Home with success message
      router.replace({
        pathname: "/customer/home",
        params: {
          successMessage: `✅ Prototype Order #${newOrderNo} placed locally`,
        },
      });
    } catch (err) {
      alert("Prototype Save Error");
    }
  };

  // Back to menu
  const addMore = () => {
    router.push({
      pathname: "/customer/menu",
      params: { cart: JSON.stringify(cartItems) },
    });
  };

  // Cancel order
  const cancelOrder = () => {
    setCartItems([]);
    router.replace("/customer/menu");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
        {/* HEADER */}
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

        {/* CONTENT */}
        <View style={{ padding: SPACING.md }}>
          <Text style={{ marginBottom: SPACING.md }}>
            {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
          </Text>

          {/* ITEMS */}
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

          {/* TOTAL */}
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

          {/* PAYMENT MODE */}
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

          {/* ACTION BUTTONS */}
          <View
            style={{
              flexDirection: "row",
              marginTop: SPACING.lg,
            }}
          >
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
    </SafeAreaView>
  );
}
