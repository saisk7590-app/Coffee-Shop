import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONT } from "../../constants";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "../../lib/supabase";

/* ================= CATEGORY IMAGE MAP ================= */
const CATEGORY_IMAGES = {
  Coffee: require("../../assets/coffee.jpg"),
  Mocktails: require("../../assets/mocktails.jpg"),
  "Special Snacks": require("../../assets/snacks.jpg"),
};

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

  /* ================= FETCH MENU FROM SUPABASE ================= */
  useEffect(() => {
    fetchMenu();
  }, []);

  async function fetchMenu() {
    try {
      setLoading(true);

      // Fetch categories
      const { data: categoryData, error: catError } = await supabase
        .from("categories")
        .select("*")
        .order("id", { ascending: true });

      if (catError) throw catError;

      // Fetch items with category relation
      const { data: itemsData, error: itemError } = await supabase
        .from("items")
        .select("*, categories(name)")
        .eq("is_available", true)
        .order("id", { ascending: true });

      if (itemError) throw itemError;

      // Group items by category name
      const groupedMenu = {};

      categoryData.forEach((cat) => {
        groupedMenu[cat.name] = [];
      });

      itemsData.forEach((item) => {
        const categoryName = item.categories?.name;
        if (categoryName) {
          groupedMenu[categoryName].push({
            ...item,
            price: Number(item.price),
          });
        }
      });

      setMenu(groupedMenu);
      setCategories(Object.keys(groupedMenu));
    } catch (err) {
      console.log("Menu fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  }

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: SPACING.sm }}>Loading menu...</Text>
      </View>
    );
  }

  /* ================= EMPTY SAFETY ================= */
  if (!categories.length) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No menu available</Text>
      </View>
    );
  }

  const category = categories[categoryIndex];
  const items = menu[category] || [];
  const hasItems = Object.keys(cart).length > 0;
  const isLastCategory = categoryIndex === categories.length - 1;

  /* ================= CART LOGIC ================= */
  const changeQty = (item, delta) => {
    setCart((prev) => {
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
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* ================= HEADER ================= */}
      <View
        style={{
          padding: SPACING.md,
          borderBottomWidth: 1,
          borderColor: COLORS.border,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#fff",
          elevation: 3,
        }}
      >
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

        {categoryIndex === 0 && <View style={{ width: 26 }} />}
      </View>

      {/* ================= ITEMS ================= */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: SPACING.md }}
        ListHeaderComponent={
          CATEGORY_IMAGES[category] && (
            <Image
              source={CATEGORY_IMAGES[category]}
              style={{
                width: "100%",
                height: 160,
                borderRadius: 14,
                marginBottom: SPACING.md,
              }}
              resizeMode="cover"
            />
          )
        }
        renderItem={({ item }) => {
          const qty = cart[item.id]?.qty || 0;

          return (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                padding: SPACING.md,
                marginBottom: SPACING.sm,
                borderRadius: 12,
                backgroundColor: "#fff",
                elevation: 2,
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
              }}
            >
              <View>
                <Text style={{ fontSize: FONT.normal, fontWeight: "500" }}>
                  {item.name}
                </Text>
                <Text
                  style={{
                    color: COLORS.primary,
                    marginTop: 4,
                    fontWeight: "600",
                  }}
                >
                  ₹ {item.price.toFixed(2)}
                </Text>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {qty > 0 && (
                  <Pressable
                    onPress={() => changeQty(item, -1)}
                    style={{
                      backgroundColor: "#eee",
                      width: 32,
                      height: 32,
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>−</Text>
                  </Pressable>
                )}

                {qty > 0 && (
                  <Text style={{ marginHorizontal: SPACING.md }}>
                    {qty}
                  </Text>
                )}

                <Pressable
                  onPress={() => changeQty(item, 1)}
                  style={{
                    backgroundColor: COLORS.primary,
                    width: 32,
                    height: 32,
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ fontSize: 18, color: "#fff" }}>+</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          hasItems ? (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/customer/bill",
                  params: { cart: JSON.stringify(cart) },
                })
              }
              style={{
                marginTop: SPACING.md,
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor: COLORS.primary,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: FONT.normal,
                  fontWeight: "600",
                }}
              >
                View Order
              </Text>
            </Pressable>
          ) : null
        }
      />

      {/* ================= FOOTER NAV ================= */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: SPACING.md,
          borderTopWidth: 1,
          borderColor: COLORS.border,
          backgroundColor: "#fff",
        }}
      >
        {categoryIndex > 0 ? (
          <Pressable onPress={() => setCategoryIndex(categoryIndex - 1)}>
            <Text style={{ color: COLORS.primary, fontWeight: "600" }}>
              ⬅ Back
            </Text>
          </Pressable>
        ) : (
          <View />
        )}

        {!isLastCategory && (
          <Pressable onPress={() => setCategoryIndex(categoryIndex + 1)}>
            <Text style={{ color: COLORS.primary, fontWeight: "600" }}>
              Next ➡
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
