import { View, Text, Pressable, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONT, API_URL } from "../../constants";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function Menu() {
  const router = useRouter();
  const { cart: previousCart } = useLocalSearchParams();

  const [menu, setMenu] = useState({});
  const [categories, setCategories] = useState([]);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [cart, setCart] = useState(
    previousCart ? JSON.parse(previousCart) : {}
  );
  const [loading, setLoading] = useState(true);

  /* ================= FETCH MENU (MOCKED) ================= */
  useEffect(() => {
    const dummyMenu = {
      "Coffee": [
        { id: 1, name: "Espresso", price: 120 },
        { id: 2, name: "Cappuccino", price: 180 },
        { id: 3, name: "Latte", price: 200 }
      ],
      "Tea": [
        { id: 4, name: "Masala Chai", price: 60 },
        { id: 5, name: "Green Tea", price: 80 }
      ],
      "Snacks": [
        { id: 6, name: "Sandwich", price: 150 },
        { id: 7, name: "Cookies", price: 90 }
      ]
    };

    setMenu(dummyMenu);
    setCategories(Object.keys(dummyMenu));
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: SPACING.sm }}>Loading menu...</Text>
      </View>
    );
  }

  const category = categories[categoryIndex];
  const items = menu[category] || [];
  const hasItems = Object.values(cart).some(i => i.qty > 0);
  const isLastCategory = categoryIndex === categories.length - 1;

  /* ================= CART LOGIC ================= */
  const changeQty = (item, delta) => {
    setCart(prev => {
      const currentQty = prev[item.id]?.qty || 0;
      const newQty = Math.max(0, currentQty + delta);

      if (newQty === 0) {
        const updated = { ...prev };
        delete updated[item.id];
        return updated;
      }

      return {
        ...prev,
        [item.id]: { ...item, qty: newQty },
      };
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>

        {/* HEADER */}
        <View
          style={{
            padding: SPACING.md,
            borderBottomWidth: 1,
            borderColor: COLORS.border,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {/* BACK ICON — ONLY FIRST CATEGORY */}
          {categoryIndex === 0 && (
            <Pressable onPress={() => router.replace("/customer/home")}>
              <Ionicons
                name="chevron-back"
                size={26}
                color={COLORS.primary}
              />
            </Pressable>
          )}

          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: FONT.subtitle, fontWeight: "bold" }}>
              {category} ({categoryIndex + 1} of {categories.length})
            </Text>
          </View>

          {/* spacer for symmetry */}
          {categoryIndex === 0 && <View style={{ width: 26 }} />}
        </View>

        {/* ITEMS + VIEW ORDER */}
        <FlatList
          data={items}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ padding: SPACING.md }}
          renderItem={({ item }) => {
            const qty = cart[item.id]?.qty || 0;

            return (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  padding: SPACING.md,
                  marginBottom: SPACING.sm,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  borderRadius: 8,
                  backgroundColor: "#fff",
                }}
              >
                <View>
                  <Text style={{ fontSize: FONT.normal }}>{item.name}</Text>
                  <Text style={{ color: COLORS.primary, marginTop: 4 }}>
                    ₹ {item.price.toFixed(2)}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Pressable onPress={() => changeQty(item, -1)}>
                    <Text style={{ fontSize: 22 }}>−</Text>
                  </Pressable>

                  <Text style={{ marginHorizontal: SPACING.md }}>{qty}</Text>

                  <Pressable onPress={() => changeQty(item, 1)}>
                    <Text style={{ fontSize: 22 }}>+</Text>
                  </Pressable>
                </View>
              </View>
            );
          }}

          /* 🔥 THIS FIXES YOUR BUTTON ISSUE */
          ListFooterComponent={
            hasItems ? (
              <View
                style={{
                  alignItems: "flex-end",
                  marginTop: SPACING.sm,
                }}
              >
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/customer/bill",
                      params: { cart: JSON.stringify(cart) },
                    })
                  }
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 14,
                    borderRadius: 6,
                    backgroundColor: COLORS.primary,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: FONT.small,
                      fontWeight: "600",
                    }}
                  >
                    View Order
                  </Text>
                </Pressable>
              </View>
            ) : null
          }
        />

        {/* FOOTER NAV */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            padding: SPACING.md,
            borderTopWidth: 1,
            borderColor: COLORS.border,
          }}
        >
          {categoryIndex > 0 ? (
            <Pressable onPress={() => setCategoryIndex(categoryIndex - 1)}>
              <Text>⬅ Back</Text>
            </Pressable>
          ) : (
            <View />
          )}

          {!isLastCategory && (
            <Pressable onPress={() => setCategoryIndex(categoryIndex + 1)}>
              <Text>Next ➡</Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
