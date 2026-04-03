import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { COLORS } from "../../constants";
import {
  createCategory,
  createMenuItem,
  disableCategory,
  disableMenuItem,
  enableCategory,
  enableMenuItem,
  fetchCategories,
  updateCategory,
  updateMenuItem,
} from "../../lib/admin-api";
import { getErrorMessage } from "../../lib/api";
import { Button, Card, EmptyState, ErrorText, Field, InlineActions, LoadingState, Screen, SectionTitle, StatusBadge } from "../../lib/admin-ui";
import { useResponsive } from "../../lib/responsive";

const emptyCategoryForm = { id: null, name: "" };
const emptyItemForm = { id: null, category_id: null, name: "", price: "", image_url: "" };

export default function MenuScreen() {
  const responsive = useResponsive();
  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      setCategories(await fetchCategories());
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Failed to load menu admin data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submitCategory = async () => {
    if (!categoryForm.name.trim()) {
      setError("Category name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      if (categoryForm.id) {
        await updateCategory(categoryForm.id, { name: categoryForm.name.trim() });
      } else {
        await createCategory({ name: categoryForm.name.trim() });
      }
      setCategoryForm(emptyCategoryForm);
      await load();
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Failed to save category"));
    } finally {
      setSaving(false);
    }
  };

  const submitItem = async () => {
    if (!itemForm.category_id || !itemForm.name.trim() || !itemForm.price.trim()) {
      setError("Category, menu item name, and price are required.");
      return;
    }

    const payload = {
      category_id: itemForm.category_id,
      name: itemForm.name.trim(),
      price: Number(itemForm.price),
      image_url: itemForm.image_url.trim() || null,
    };

    try {
      setSaving(true);
      setError("");
      if (itemForm.id) {
        await updateMenuItem(itemForm.id, payload);
      } else {
        await createMenuItem(payload);
      }
      setItemForm(emptyItemForm);
      await load();
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Failed to save menu item"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen title="Menu Management">
      {error ? <ErrorText>{error}</ErrorText> : null}

      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
        <Card style={{ width: responsive.isMobile ? "100%" : "48%" }}>
          <SectionTitle>{categoryForm.id ? "Edit Category" : "Add Category"}</SectionTitle>
          <Field placeholder="Category name" value={categoryForm.name} onChangeText={(value) => setCategoryForm((current) => ({ ...current, name: value }))} />
          <InlineActions>
            <Button label={categoryForm.id ? "Update Category" : "Add Category"} onPress={submitCategory} disabled={saving} />
            {categoryForm.id ? <Button label="Cancel" variant="secondary" onPress={() => setCategoryForm(emptyCategoryForm)} /> : null}
          </InlineActions>
        </Card>

        <Card style={{ width: responsive.isMobile ? "100%" : "48%" }}>
          <SectionTitle>{itemForm.id ? "Edit Menu Item" : "Add Menu Item"}</SectionTitle>
          <Field placeholder="Menu item name" value={itemForm.name} onChangeText={(value) => setItemForm((current) => ({ ...current, name: value }))} />
          <Field placeholder="Price" value={itemForm.price} onChangeText={(value) => setItemForm((current) => ({ ...current, price: value }))} keyboardType="numeric" />
          <Field placeholder="Image URL (optional)" value={itemForm.image_url} onChangeText={(value) => setItemForm((current) => ({ ...current, image_url: value }))} />
          <View style={{ gap: 8, marginBottom: 8 }}>
            <Text style={{ color: COLORS.mutedText, fontSize: responsive.smallSize }}>Choose Category</Text>
            <InlineActions style={{ marginTop: 0 }}>
              {categories.filter((category) => category.is_available).map((category) => {
                const selected = itemForm.category_id === category.id;
                return (
                  <Button
                    key={category.id}
                    label={selected ? `Selected: ${category.name}` : category.name}
                    variant={selected ? "primary" : "secondary"}
                    onPress={() => setItemForm((current) => ({ ...current, category_id: category.id }))}
                  />
                );
              })}
            </InlineActions>
          </View>
          <InlineActions>
            <Button label={itemForm.id ? "Update Item" : "Add Item"} onPress={submitItem} disabled={saving} />
            {itemForm.id ? <Button label="Cancel" variant="secondary" onPress={() => setItemForm(emptyItemForm)} /> : null}
          </InlineActions>
        </Card>
      </View>

      {loading ? (
        <LoadingState />
      ) : categories.length ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
          {categories.map((category) => (
            <Card key={category.id} style={{ width: responsive.cardWidth }}>
              <SectionTitle>{category.name}</SectionTitle>
              <StatusBadge label={category.is_available ? "Enabled" : "Disabled"} tone={category.is_available ? "success" : "danger"} />
              <InlineActions>
                <Button label="Edit" variant="secondary" onPress={() => setCategoryForm({ id: category.id, name: category.name })} />
                {category.is_available ? (
                  <Button label="Disable" variant="danger" onPress={async () => { setSaving(true); setError(""); try { await disableCategory(category.id); await load(); } catch (e) { setError(getErrorMessage(e, "Failed to disable category")); } finally { setSaving(false); } }} />
                ) : (
                  <Button label="Enable" onPress={async () => { setSaving(true); setError(""); try { await enableCategory(category.id); await load(); } catch (e) { setError(getErrorMessage(e, "Failed to enable category")); } finally { setSaving(false); } }} />
                )}
              </InlineActions>

              <View style={{ marginTop: responsive.gap / 1.5, gap: 10 }}>
                {category.items?.length ? (
                  category.items.map((item) => (
                    <View
                      key={item.id}
                      style={{
                        backgroundColor: item.is_available ? COLORS.surface : "#fff3f1",
                        borderWidth: 1,
                        borderColor: item.is_available ? COLORS.border : "#f1b0a7",
                        borderRadius: 12,
                        padding: 12,
                      }}
                    >
                      <Text style={{ color: COLORS.text, fontWeight: "700", fontSize: responsive.bodySize }}>{item.name}</Text>
                      <Text style={{ color: COLORS.mutedText, fontSize: responsive.smallSize }}>
                        Rs. {Number(item.price).toFixed(2)}
                      </Text>
                      <StatusBadge label={item.is_available ? "Enabled" : "Disabled"} tone={item.is_available ? "success" : "danger"} />
                      <InlineActions>
                        <Button label="Edit" variant="secondary" onPress={() => setItemForm({ id: item.id, category_id: item.category_id, name: item.name, price: String(item.price), image_url: item.image_url || "" })} />
                        {item.is_available ? (
                          <Button label="Disable" variant="danger" onPress={async () => { setSaving(true); setError(""); try { await disableMenuItem(item.id); await load(); } catch (e) { setError(getErrorMessage(e, "Failed to disable menu item")); } finally { setSaving(false); } }} />
                        ) : (
                          <Button label="Enable" onPress={async () => { setSaving(true); setError(""); try { await enableMenuItem(item.id); await load(); } catch (e) { setError(getErrorMessage(e, "Failed to enable menu item")); } finally { setSaving(false); } }} />
                        )}
                      </InlineActions>
                    </View>
                  ))
                ) : (
                  <EmptyState>No menu items yet.</EmptyState>
                )}
              </View>
            </Card>
          ))}
        </View>
      ) : (
        <EmptyState>No categories found.</EmptyState>
      )}
    </Screen>
  );
}
