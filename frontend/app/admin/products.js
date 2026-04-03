import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { COLORS } from "../../constants";
import { createProduct, disableProduct, enableProduct, fetchProducts, updateProduct } from "../../lib/admin-api";
import { getErrorMessage } from "../../lib/api";
import { Button, Card, EmptyState, ErrorText, Field, InlineActions, LoadingState, Screen, SectionTitle, StatusBadge } from "../../lib/admin-ui";
import { useResponsive } from "../../lib/responsive";

const emptyForm = {
  id: null,
  name: "",
  price: "",
  unit: "",
  description: "",
  image_url: "",
  category: "",
};

export default function ProductsScreen() {
  const responsive = useResponsive();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      setProducts(await fetchProducts());
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Failed to load products"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    if (!form.name.trim() || !form.price.trim() || !form.unit.trim()) {
      setError("Product name, price, and unit are required.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      unit: form.unit.trim(),
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      category: form.category.trim() || null,
    };

    try {
      setSaving(true);
      setError("");
      if (form.id) {
        await updateProduct(form.id, payload);
      } else {
        await createProduct(payload);
      }
      setForm(emptyForm);
      await load();
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Failed to save product"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen title="Products">
      {error ? <ErrorText>{error}</ErrorText> : null}

      <Card>
        <SectionTitle>{form.id ? "Edit Product" : "Add Product"}</SectionTitle>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
          <Field placeholder="Name" value={form.name} onChangeText={(value) => setForm((current) => ({ ...current, name: value }))} style={{ width: responsive.isMobile ? "100%" : "48%" }} />
          <Field placeholder="Price" value={form.price} keyboardType="numeric" onChangeText={(value) => setForm((current) => ({ ...current, price: value }))} style={{ width: responsive.isMobile ? "100%" : "48%" }} />
          <Field placeholder="Unit" value={form.unit} onChangeText={(value) => setForm((current) => ({ ...current, unit: value }))} style={{ width: responsive.isMobile ? "100%" : "48%" }} />
          <Field placeholder="Category (optional)" value={form.category} onChangeText={(value) => setForm((current) => ({ ...current, category: value }))} style={{ width: responsive.isMobile ? "100%" : "48%" }} />
          <Field placeholder="Image URL (optional)" value={form.image_url} onChangeText={(value) => setForm((current) => ({ ...current, image_url: value }))} />
          <Field placeholder="Description (optional)" value={form.description} onChangeText={(value) => setForm((current) => ({ ...current, description: value }))} multiline />
        </View>
        <InlineActions>
          <Button label={form.id ? "Update Product" : "Add Product"} onPress={submit} disabled={saving} />
          {form.id ? <Button label="Cancel" variant="secondary" onPress={() => setForm(emptyForm)} /> : null}
        </InlineActions>
      </Card>

      {loading ? (
        <LoadingState />
      ) : products.length ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
          {products.map((product) => (
            <Card key={product.id} style={{ width: responsive.cardWidth }}>
              <SectionTitle>{product.name}</SectionTitle>
              <Text style={{ color: COLORS.mutedText, fontSize: responsive.smallSize }}>
                Rs. {Number(product.price).toFixed(2)} / {product.unit}
              </Text>
              {product.category ? <Text style={{ color: COLORS.mutedText, fontSize: responsive.smallSize }}>Category: {product.category}</Text> : null}
              {product.description ? <Text style={{ color: COLORS.text, marginTop: 6, fontSize: responsive.bodySize }}>{product.description}</Text> : null}
              <StatusBadge label={product.is_available ? "Enabled" : "Disabled"} tone={product.is_available ? "success" : "danger"} />
              <InlineActions>
                <Button label="Edit" variant="secondary" onPress={() => setForm({ id: product.id, name: product.name, price: String(product.price), unit: product.unit, description: product.description || "", image_url: product.image_url || "", category: product.category || "" })} />
                {product.is_available ? (
                  <Button label="Disable" variant="danger" onPress={async () => { setSaving(true); setError(""); try { await disableProduct(product.id); await load(); } catch (e) { setError(getErrorMessage(e, "Failed to disable product")); } finally { setSaving(false); } }} />
                ) : (
                  <Button label="Enable" onPress={async () => { setSaving(true); setError(""); try { await enableProduct(product.id); await load(); } catch (e) { setError(getErrorMessage(e, "Failed to enable product")); } finally { setSaving(false); } }} />
                )}
              </InlineActions>
            </Card>
          ))}
        </View>
      ) : (
        <EmptyState>No products found.</EmptyState>
      )}
    </Screen>
  );
}
