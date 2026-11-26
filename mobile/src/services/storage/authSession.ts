import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export type AuthSession = {
  token: string;
  userId: string;
  email: string;
  role: 'candidate' | 'recruiter';
};

let webSession: AuthSession | null = null;

export async function getAuthToken(): Promise<string | null> {
  if (Platform.OS === 'web') return webSession?.token ?? null;
  return SecureStore.getItemAsync('auth_token');
}

export async function clearSession(): Promise<void> {
  if (Platform.OS === 'web') {
    webSession = null;
    return;
  }
  await Promise.all([
    SecureStore.deleteItemAsync('auth_token'),
    SecureStore.deleteItemAsync('auth_user'),
  ]);
}

export async function saveAuthSession(session: AuthSession): Promise<void> {
  if (Platform.OS === 'web') {
    webSession = session;
    return;
  }

  const { userId, email, role, token } = session;
  try {
    await SecureStore.setItemAsync('auth_user', JSON.stringify({ userId, email, role }));
    await SecureStore.setItemAsync('auth_token', token);
  } catch (error) {
    await clearSession();
    throw error;
  }
}
