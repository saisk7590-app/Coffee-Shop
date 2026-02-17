import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * API Configuration for Coffee Shop App (Collector)
 */

const getApiUrl = () => {
    // 1. FOR WEB
    if (Platform.OS === 'web') {
        return 'http://localhost:4000';
    }

    // 2. FOR MOBILE: Use environment variable
    const envApiUrl = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;

    if (envApiUrl) {
        return envApiUrl;
    }

    // Fallback
    return 'http://localhost:3000';
};

export const API_URL = getApiUrl();
