import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_TOKEN_KEY = "coffee_auth_token";
const AUTH_ROLE_KEY = "coffee_auth_role";

export const saveAuthSession = async ({ token, role }) => {
  await AsyncStorage.multiSet([
    [AUTH_TOKEN_KEY, token],
    [AUTH_ROLE_KEY, role],
  ]);
};

export const getAuthToken = async () => {
  return AsyncStorage.getItem(AUTH_TOKEN_KEY);
};

export const getAuthRole = async () => {
  return AsyncStorage.getItem(AUTH_ROLE_KEY);
};

export const clearAuthSession = async () => {
  await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_ROLE_KEY]);
};
