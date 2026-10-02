import { Platform } from 'react-native';

// Fallback logic for development environments (Android emulator vs iOS / web)
const defaultHost = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

export const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || `${defaultHost}/api`,
  SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL || defaultHost,
  APP_NAME: 'Sonique',
  VERSION: '1.0.0',
};
