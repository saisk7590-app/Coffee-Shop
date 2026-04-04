import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  Pressable,
  Text,
  View,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { COLORS, API_URL } from "../../constants";
import { useResponsive } from "../../lib/responsive";

const normalizeWhatsappNumber = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `91${digits}`;
  return digits;
};

export default function Products() {
  const responsive = useResponsive();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [ownerPhone, setOwnerPhone] = useState("");
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState({});

  // ✅ LOAD DATA
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const [productsResponse, ownerResponse] = await Promise.all([
          fetch(`${API_URL}/products`, {
            headers: { "Bypass-Tunnel-Reminder": "true" },
          }),
          fetch(`${API_URL}/owner-contact`, {
            headers: { "Bypass-Tunnel-Reminder": "true" },
          }),
        ]);

        const productsPayload = await productsResponse.json();
        const ownerPayload = await ownerResponse.json();

        setProducts(productsPayload?.data || []);
        setOwnerPhone(ownerPayload?.phone || "");
      } catch (error) {
        console.log("Products fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // ✅ ADD ITEM
  const addToCart = (product) => {
    setCart((prev) => {
      const qty = prev[product.id]?.quantity || 0;
      return {
        ...prev,
        [product.id]: {
          ...product,
          quantity: qty + 1,
        },
      };
    });
  };

  // ✅ REMOVE ITEM
  const removeFromCart = (productId) => {
    setCart((prev) => {
      const item = prev[productId];
      if (!item) return prev;

      if (item.quantity === 1) {
        const newCart = { ...prev };
        delete newCart[productId];
        return newCart;
      }

      return {
        ...prev,
        [productId]: {
          ...item,
          quantity: item.quantity - 1,
        },
      };
    });
  };

  // ✅ UNIT → GRAMS
  const convertToGrams = (unit) => {
    const value = parseFloat(unit) || 0;
    const label = unit.replace(/[0-9.]/g, "").toLowerCase();

    if (label === "kg") return value * 1000;
    return value; // assume grams
  };

  // ✅ GRAMS → DISPLAY
  const formatQty = (grams) => {
    if (grams >= 1000) {
      return `${(grams / 1000).toFixed(2)} kg`;
    }
    return `${grams} g`;
  };

  // ✅ WHATSAPP ORDER
  const orderCartViaWhatsApp = async () => {
    const whatsappNumber = normalizeWhatsappNumber(ownerPhone);

    if (!whatsappNumber) {
      Alert.alert("Owner Number Missing");
      return;
    }

    const items = Object.values(cart);

    if (!items.length) {
      Alert.alert("Cart Empty", "Add items first");
      return;
    }

    let totalPrice = 0;
    let totalItems = 0;
    let totalGrams = 0;

    const messageItems = items.map((item, index) => {
      const itemTotal = item.price * item.quantity;
      totalPrice += itemTotal;
      totalItems += item.quantity;

      const gramsPerUnit = convertToGrams(item.unit);
      const itemTotalGrams = gramsPerUnit * item.quantity;
      totalGrams += itemTotalGrams;

      return `${index + 1}. ${item.name}
Qty: ${item.quantity} × ${item.unit}
Total Qty: ${formatQty(itemTotalGrams)}
Price: ₹${itemTotal}`;
    });

    const message = `🛒 *New Order*

${messageItems.join("\n\n")}

----------------------------------
🧾 Total Items: ${totalItems}
⚖️ Total Quantity: ${formatQty(totalGrams)}
💰 Total Price: ₹${totalPrice}
----------------------------------`;

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;

    await Linking.openURL(url);
  };

  // ✅ LOADING
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const itemWidth = responsive.isMobile
    ? responsive.innerWidth
    : responsive.cardWidth;

  const cartItemsCount = Object.keys(cart).length;

  const totalPrice = Object.values(cart).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        key={responsive.numColumns}
        style={{ flex: 1, backgroundColor: COLORS.background }}
        contentContainerStyle={{
          padding: responsive.screenPadding,
          paddingBottom: 100,
        }}
        data={products}
        numColumns={responsive.numColumns}
        columnWrapperStyle={
          responsive.numColumns > 1
            ? { justifyContent: "space-between", gap: responsive.gap }
            : null
        }
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => {
          const isLeftOverSingle =
            responsive.numColumns === 2 &&
            products.length % 2 === 1 &&
            index === products.length - 1;

          const width = isLeftOverSingle
            ? responsive.contentWidth
            : itemWidth;

          const qty = cart[item.id]?.quantity || 0;

          return (
            <View style={{ width, marginBottom: responsive.gap }}>
              <View
                style={{
                  backgroundColor: "#fff",
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                {item.image_url && (
                  <Image
                    source={{ uri: item.image_url }}
                    style={{
                      width: "100%",
                      height: responsive.isLarge
                        ? 220
                        : responsive.isCompactPhone
                        ? 150
                        : 170,
                    }}
                    resizeMode="cover"
                  />
                )}

                <View style={{ padding: responsive.gap }}>
                  <Text
                    style={{
                      fontSize: responsive.subtitleSize,
                      fontWeight: "bold",
                    }}
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={{
                      color: COLORS.primary,
                      marginTop: 4,
                      fontSize: responsive.bodySize,
                    }}
                  >
                    ₹{Number(item.price).toFixed(2)} / {item.unit}
                  </Text>

                  <Text
                    style={{
                      color: COLORS.mutedText,
                      marginTop: 6,
                      fontSize: responsive.smallSize,
                    }}
                  >
                    {item.description}
                  </Text>

                  {qty === 0 ? (
                    <Pressable
                      onPress={() => addToCart(item)}
                      style={{
                        marginTop: 10,
                        backgroundColor: COLORS.primary,
                        paddingVertical: 10,
                        borderRadius: 8,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "bold" }}>
                        Add to Cart
                      </Text>
                    </Pressable>
                  ) : (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 10,
                        gap: 20,
                      }}
                    >
                      <Pressable
                        onPress={() => removeFromCart(item.id)}
                        style={{
                          backgroundColor: COLORS.border,
                          padding: 8,
                          borderRadius: 6,
                        }}
                      >
                        <Text>-</Text>
                      </Pressable>

                      <Text style={{ fontWeight: "bold" }}>{qty}</Text>

                      <Pressable
                        onPress={() => addToCart(item)}
                        style={{
                          backgroundColor: COLORS.primary,
                          padding: 8,
                          borderRadius: 6,
                        }}
                      >
                        <Text style={{ color: "#fff" }}>+</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        }}
        ListHeaderComponent={
          <View
            style={{
              width: responsive.contentWidth,
              marginBottom: responsive.gap,
            }}
          >
            <Pressable onPress={() => router.replace("/customer/home")}>
              <Text style={{ color: COLORS.primary, marginBottom: 8 }}>
                Back
              </Text>
            </Pressable>

            <Text
              style={{
                fontSize: responsive.titleSize,
                fontWeight: "bold",
              }}
            >
              Products
            </Text>
          </View>
        }
      />

      {/* ✅ FLOATING BUTTON */}
      {cartItemsCount > 0 && (
        <Pressable
          onPress={orderCartViaWhatsApp}
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            right: 20,
            backgroundColor: COLORS.primary,
            padding: 16,
            borderRadius: 12,
            alignItems: "center",
            elevation: 5,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
            🛒 {cartItemsCount} Items | ₹{totalPrice} → Order Now
          </Text>
        </Pressable>
      )}
    </View>
  );
}