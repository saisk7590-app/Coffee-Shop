import { ActivityIndicator, FlatList, Image, Linking, Pressable, Text, View, Alert } from "react-native";
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

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const [productsResponse, ownerResponse] = await Promise.all([
          fetch(`${API_URL}/products`, { headers: { "Bypass-Tunnel-Reminder": "true" } }),
          fetch(`${API_URL}/owner-contact`, { headers: { "Bypass-Tunnel-Reminder": "true" } }),
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

  const orderViaWhatsApp = async (product) => {
    const whatsappNumber = normalizeWhatsappNumber(ownerPhone);
    if (!whatsappNumber) {
      Alert.alert("Owner Number Missing", "Admin phone number is not available yet.");
      return;
    }

    const message = `New Order\n\n${product.name} (${product.unit}) - Rs. ${Number(product.price).toFixed(2)}`;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    await Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const itemWidth = responsive.isMobile ? responsive.innerWidth : responsive.cardWidth;

  return (
    <FlatList
      key={responsive.numColumns}
      style={{ flex: 1, backgroundColor: COLORS.background }}
      contentContainerStyle={{ padding: responsive.screenPadding }}
      data={products}
      numColumns={responsive.numColumns}
      columnWrapperStyle={responsive.numColumns > 1 ? { justifyContent: "space-between", gap: responsive.gap } : null}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item, index }) => {
        const isLeftOverSingle = responsive.numColumns === 2 && products.length % 2 === 1 && index === products.length - 1;
        const width = isLeftOverSingle ? responsive.contentWidth : itemWidth;

        return (
          <View style={{ width, marginBottom: responsive.gap }}>
            <View style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, overflow: "hidden" }}>
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={{ width: "100%", height: responsive.isLarge ? 220 : responsive.isCompactPhone ? 150 : 170 }} resizeMode="cover" />
              ) : null}

              <View style={{ padding: responsive.isAndroidPhone ? 10 : responsive.gap }}>
                <Text style={{ fontSize: responsive.subtitleSize, fontWeight: "bold" }}>{item.name}</Text>
                <Text style={{ color: COLORS.primary, marginTop: 4, fontSize: responsive.bodySize }}>
                  Rs. {Number(item.price).toFixed(2)} / {item.unit}
                </Text>
                <Text style={{ color: COLORS.mutedText, marginTop: 6, fontSize: responsive.smallSize }}>
                  {item.description}
                </Text>

                <Pressable
                  onPress={() => orderViaWhatsApp(item)}
                  disabled={!ownerPhone}
                  style={{
                    marginTop: responsive.isAndroidPhone ? 10 : responsive.gap,
                    backgroundColor: ownerPhone ? COLORS.primary : COLORS.border,
                    paddingVertical: responsive.isCompactPhone ? 10 : responsive.buttonHeight / 4,
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold", fontSize: responsive.bodySize }}>
                    {ownerPhone ? "Order via WhatsApp" : "Owner number not available"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        );
      }}
      ListHeaderComponent={
        <View style={{ width: responsive.contentWidth, marginBottom: responsive.gap }}>
          <Pressable onPress={() => router.replace("/customer/home")}>
            <Text style={{ color: COLORS.primary, marginBottom: 8, fontSize: responsive.bodySize }}>Back</Text>
          </Pressable>
          <Text style={{ fontSize: responsive.titleSize, fontWeight: "bold" }}>Products</Text>
        </View>
      }
    />
  );
}
