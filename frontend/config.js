import Constants from "expo-constants";
import { Platform } from "react-native";

const normalizeBaseUrl = (value) => {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim().replace(/\/+$/, "");
  return trimmedValue.endsWith("/api") ? trimmedValue : `${trimmedValue}/api`;
};

const getApiBaseUrl = () => {
  const explicitBaseUrl =
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    process.env.EXPO_PUBLIC_API_URL ||
    Constants.expoConfig?.extra?.apiBaseUrl ||
    Constants.expoConfig?.extra?.apiUrl;

  if (explicitBaseUrl) {
    return normalizeBaseUrl(explicitBaseUrl);
  }

  if (Platform.OS === "web") {
    return "http://localhost:5000/api";
  }

  return "http://10.0.2.2:5000/api";
};

export const API_BASE_URL = getApiBaseUrl();
export const API_URL = API_BASE_URL;
