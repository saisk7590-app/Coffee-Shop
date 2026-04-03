import { api } from "./api";

export const fetchSummary = async () => {
  const response = await api.get("/analytics/summary");
  return response.data.data;
};

export const fetchOrdersTrend = async () => {
  const response = await api.get("/analytics/orders-trend");
  return response.data.data;
};

export const fetchRevenueTrend = async () => {
  const response = await api.get("/analytics/revenue-trend");
  return response.data.data;
};

export const fetchTopItems = async () => {
  const response = await api.get("/analytics/top-items");
  return response.data.data;
};

export const fetchOrderStatus = async () => {
  const response = await api.get("/analytics/order-status");
  return response.data.data;
};

export const fetchCategories = async () => {
  const response = await api.get("/categories?includeItems=true&includeUnavailable=true");
  return response.data.data;
};

export const createCategory = async (payload) => {
  const response = await api.post("/categories", payload);
  return response.data.data;
};

export const updateCategory = async (id, payload) => {
  const response = await api.put(`/categories/${id}`, payload);
  return response.data.data;
};

export const disableCategory = async (id) => {
  const response = await api.patch(`/categories/${id}/disable`);
  return response.data.data;
};

export const enableCategory = async (id) => {
  const response = await api.patch(`/categories/${id}/enable`);
  return response.data.data;
};

export const createMenuItem = async (payload) => {
  const response = await api.post("/menu-items", payload);
  return response.data.data;
};

export const updateMenuItem = async (id, payload) => {
  const response = await api.put(`/menu-items/${id}`, payload);
  return response.data.data;
};

export const disableMenuItem = async (id) => {
  const response = await api.patch(`/menu-items/${id}/disable`);
  return response.data.data;
};

export const enableMenuItem = async (id) => {
  const response = await api.patch(`/menu-items/${id}/enable`);
  return response.data.data;
};

export const fetchProducts = async () => {
  const response = await api.get("/products?includeUnavailable=true");
  return response.data.data;
};

export const createProduct = async (payload) => {
  const response = await api.post("/products", payload);
  return response.data.data;
};

export const updateProduct = async (id, payload) => {
  const response = await api.put(`/products/${id}`, payload);
  return response.data.data;
};

export const disableProduct = async (id) => {
  const response = await api.patch(`/products/${id}/disable`);
  return response.data.data;
};

export const enableProduct = async (id) => {
  const response = await api.patch(`/products/${id}/enable`);
  return response.data.data;
};
