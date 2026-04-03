import { View, Text, Pressable, FlatList, ActivityIndicator, Image } from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, API_URL } from "../../constants";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useResponsive } from "../../lib/responsive";

const CATEGORY_IMAGES = {
  Coffee: require("../../assets/coffee.jpg"),
  Mocktails: require("../../assets/mocktails.jpg"),
  "Special Snacks": require("../../assets/snacks.jpg"),
};

export default function Menu() {
  const responsive = useResponsive();
  const router = useRouter();
  const { cart: previousCart } = useLocalSearchParams();
  const [menu, setMenu] = useState({});
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [cart, setCart] = useState(previousCart ? JSON.parse(previousCart) : {});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/menu`, {
          headers: { "Bypass-Tunnel-Reminder": "true" },
        });
        const data = await response.json();
        const groupedMenu = {};
        const nextCategories = Object.keys(data || {});

        nextCategories.forEach((categoryName) => {
          groupedMenu[categoryName] = (data[categoryName] || []).map((item) => ({
            ...item,
            price: Number(item.price),
          }));
        });

        setMenu(groupedMenu);
        setCategories(nextCategories);
        setSelectedCategory((current) => current || nextCategories[0] || "");
      } catch (err) {
        console.log("Menu fetch error:", err.message || err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const changeQty = (item, delta) => {
    setCart((prev) => {
      const currentQty = prev[item.id]?.qty || 0;
      const newQty = Math.max(0, currentQty + delta);
      if (newQty === 0) {
        const updated = { ...prev };
        delete updated[item.id];
        return updated;
      }
      return { ...prev, [item.id]: { ...item, qty: newQty } };
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 12, color: COLORS.text }}>Loading menu...</Text>
      </View>
    );
  }

  if (!categories.length) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background }}>
        <Text>No menu available</Text>
      </View>
    );
  }

  const items = menu[selectedCategory] || [];
  const hasItems = Object.keys(cart).length > 0;

  // On phones, use innerWidth so items span the full usable width exactly.
  const itemWidth = responsive.isMobile ? responsive.innerWidth : responsive.cardWidth;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <FlatList
        key={responsive.numColumns}
        data={items}
        numColumns={responsive.numColumns}
        columnWrapperStyle={responsive.numColumns > 1 ? { justifyContent: "space-between", gap: responsive.gap } : null}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: responsive.screenPadding }}
        ListHeaderComponent={
          <View style={{ width: responsive.contentWidth, marginBottom: responsive.gap }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: responsive.gap }}>
              <Pressable onPress={() => router.replace("/customer/home")}>
                <Ionicons name="chevron-back" size={responsive.iconSize + 2} color={COLORS.primary} />
              </Pressable>
              <Text style={{ fontSize: responsive.subtitleSize, fontWeight: "bold", color: COLORS.text }}>Menu</Text>
              {hasItems ? (
                <Pressable
                  onPress={() => router.push({ pathname: "/customer/bill", params: { cart: JSON.stringify(cart) } })}
                  style={{ backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999 }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700" }}>View Order</Text>
                </Pressable>
              ) : (
                <View style={{ width: 40 }} />
              )}
            </View>

            {CATEGORY_IMAGES[selectedCategory] ? (
              <Image
                source={CATEGORY_IMAGES[selectedCategory]}
                style={{ width: "100%", height: responsive.isLarge ? 240 : responsive.isCompactPhone ? 150 : 170, borderRadius: 18, marginBottom: responsive.gap }}
                resizeMode="cover"
              />
            ) : null}

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: responsive.isAndroidPhone ? 6 : responsive.gap / 2 }}>
              {categories.map((category) => {
                const active = category === selectedCategory;
                return (
                  <Pressable
                    key={category}
                    onPress={() => setSelectedCategory(category)}
                    style={{
                      paddingHorizontal: responsive.isAndroidPhone ? 12 : 16,
                      paddingVertical: responsive.isAndroidPhone ? 8 : 10,
                      borderRadius: 999,
                      backgroundColor: active ? COLORS.primary : COLORS.surface,
                      borderWidth: 1,
                      borderColor: COLORS.border,
                    }}
                  >
                    <Text style={{ color: active ? "#fff" : COLORS.text, fontWeight: "700" }}>{category}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        renderItem={({ item, index }) => {
          const qty = cart[item.id]?.qty || 0;
          const isLeftOverSingle = responsive.numColumns === 2 && items.length % 2 === 1 && index === items.length - 1;
          const width = isLeftOverSingle ? responsive.contentWidth : itemWidth;

          return (
            <View style={{ width, marginBottom: responsive.gap }}>
              <View
                style={{
                  borderRadius: 12,
                  backgroundColor: "#fff",
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  padding: responsive.isLarge ? 20 : responsive.isCompactPhone ? 10 : 14,
                  minHeight: responsive.isLarge ? 180 : responsive.isCompactPhone ? 110 : 130,
                }}
              >
                <Text style={{ fontSize: responsive.bodySize, fontWeight: "700", color: COLORS.text }}>{item.name}</Text>
                <Text style={{ color: COLORS.primary, marginTop: 6, fontWeight: "700", fontSize: responsive.bodySize }}>
                  Rs. {item.price.toFixed(2)}
                </Text>

                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 18 }}>
                  {qty > 0 ? (
                    <Pressable
                      onPress={() => changeQty(item, -1)}
                      style={{
                      backgroundColor: "#eee",
                        width: responsive.isCompactPhone ? 38 : responsive.buttonHeight,
                        height: responsive.isCompactPhone ? 38 : responsive.buttonHeight,
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 10,
                      }}
                    >
                      <Text style={{ fontSize: responsive.subtitleSize }}>-</Text>
                    </Pressable>
                  ) : null}
                  {qty > 0 ? <Text style={{ marginHorizontal: 12, fontSize: responsive.bodySize }}>{qty}</Text> : null}
                  <Pressable
                    onPress={() => changeQty(item, 1)}
                    style={{
                      backgroundColor: COLORS.primary,
                      width: responsive.isCompactPhone ? 38 : responsive.buttonHeight,
                      height: responsive.isCompactPhone ? 38 : responsive.buttonHeight,
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 10,
                    }}
                  >
                    <Text style={{ fontSize: responsive.subtitleSize, color: "#fff" }}>+</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}
