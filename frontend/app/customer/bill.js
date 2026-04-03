import { View, Text, Pressable, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { COLORS, API_URL } from "../../constants";
import { useResponsive } from "../../lib/responsive";

export default function Bill() {
  const responsive = useResponsive();
  const router = useRouter();
  const { cart: cartParam } = useLocalSearchParams();
  const [cartItems, setCartItems] = useState(cartParam ? Object.values(JSON.parse(cartParam)).filter((i) => i.qty > 0) : []);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const total = cartItems.reduce((sum, i) => sum + i.qty * i.price, 0);

  const placeOrder = async () => {
    if (!cartItems.length) {
      alert("Cart is empty!");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Bypass-Tunnel-Reminder": "true",
        },
        body: JSON.stringify({ items: cartItems, paymentMode }),
      });

      const data = await res.json();
      router.replace({
        pathname: "/customer/home",
        params: { successMessage: `Order #${data.orderNo} placed successfully` },
      });
    } catch (err) {
      console.log("Order error:", err);
      alert("Failed to place order. Try again.");
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ padding: responsive.screenPadding }}>
        <View style={{ width: responsive.contentWidth }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: responsive.gap }}>
            <Pressable onPress={() => router.push({ pathname: "/customer/menu", params: { cart: JSON.stringify(cartItems) } })}>
              <Text style={{ color: COLORS.primary, fontSize: responsive.bodySize }}>Add More</Text>
            </Pressable>
            <Text style={{ fontSize: responsive.subtitleSize, fontWeight: "bold" }}>Checkout</Text>
            <View style={{ width: 80 }} />
          </View>

          <View style={{ flexDirection: responsive.isLarge ? "row" : "column", justifyContent: "space-between", gap: responsive.gap }}>
            <View style={{ width: responsive.isLarge ? "60%" : "100%", backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: responsive.gap }}>
              <Text style={{ marginBottom: responsive.gap / 1.5, color: COLORS.mutedText, fontSize: responsive.bodySize }}>
                {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
              </Text>
              {cartItems.map((i) => (
                <View key={i.id} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.divider }}>
                  <Text style={{ fontSize: responsive.bodySize, color: COLORS.text, flex: 1 }}>{i.name} x {i.qty}</Text>
                  <Text style={{ color: COLORS.primary, fontSize: responsive.bodySize }}>Rs. {(i.qty * i.price).toFixed(2)}</Text>
                </View>
              ))}
            </View>

            <View style={{ width: responsive.isLarge ? "35%" : "100%", backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: responsive.gap }}>
              <Text style={{ fontSize: responsive.subtitleSize, fontWeight: "bold" }}>Summary</Text>
              <Text style={{ marginTop: 12, fontSize: responsive.subtitleSize, fontWeight: "bold", color: COLORS.primary }}>
                Total: Rs. {total.toFixed(2)}
              </Text>

              <Text style={{ marginTop: responsive.gap, color: COLORS.text, fontWeight: "700", fontSize: responsive.bodySize }}>Payment Mode</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 12 }}>
                {["Cash", "Online"].map((mode) => (
                  <Pressable
                    key={mode}
                    onPress={() => setPaymentMode(mode)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: COLORS.border,
                      backgroundColor: paymentMode === mode ? COLORS.primary : "#fff",
                    }}
                  >
                    <Text style={{ color: paymentMode === mode ? COLORS.buttonText : COLORS.text, fontSize: responsive.bodySize }}>
                      {mode}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={{ marginTop: responsive.gap, gap: 12 }}>
                <Pressable onPress={() => { setCartItems([]); router.replace("/customer/menu"); }} style={{ backgroundColor: "#FF4D4D", paddingVertical: 14, borderRadius: 10, alignItems: "center" }}>
                  <Text style={{ color: "#fff", fontWeight: "bold", fontSize: responsive.bodySize }}>Cancel Order</Text>
                </Pressable>

                <Pressable onPress={placeOrder} style={{ backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 10, alignItems: "center" }}>
                  <Text style={{ color: "#fff", fontWeight: "bold", fontSize: responsive.bodySize }}>Confirm Order</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
