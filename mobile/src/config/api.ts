import { Platform } from 'react-native';

/**
 * Cấu hình API Base URL cho toàn bộ ứng dụng Mobile.
 * Ưu tiên:
 * 1. EXPO_PUBLIC_API_BASE_URL từ .env (ví dụ: https://ngrok-free.app/api)
 * 2. Android Emulator (10.0.2.2:8080/api) trỏ về localhost máy tính
 * 3. iOS Simulator / Web / Khác (localhost:8080/api)
 */

let customApiUrl: string | null = null;

export function setCustomApiBaseUrl(url: string | null) {
  customApiUrl = url;
}

export function getApiBaseUrl(): string {
  if (customApiUrl) {
    return customApiUrl.replace(/\/+$/, '');
  }

  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (Platform.OS === 'android') {
    // 10.0.2.2 là loopback alias của Android Emulator trỏ về máy tính chạy Spring Boot
    return 'http://10.0.2.2:8080/api';
  }

  return 'http://localhost:8080/api';
}

export const API_BASE_URL = getApiBaseUrl();
