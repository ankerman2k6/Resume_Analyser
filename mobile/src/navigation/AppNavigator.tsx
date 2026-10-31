import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { RegisterScreen } from '../features/auth/screens/RegisterScreen';
import { WelcomeScreen } from '../features/auth/screens/WelcomeScreen';
import { colors } from '../theme';
import { CandidateTabs } from './CandidateTabs';
import {HrTabs} from './HrTabs'
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { ApiError, getCurrentUserApi } from '../features/auth/api/authApi';
import { clearSession } from '../core/apiClient';
import { HrCreateJobScreen } from '../features/hr/jobs/screens/HrCreateJobScreen';
const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>();
  useEffect(() => {
    Promise.all([SecureStore.getItemAsync('auth_token'), SecureStore.getItemAsync('auth_user')])
      .then(async ([token, raw]) => {
        if (!token || !raw) return setInitialRoute('Welcome');
        try {
          const cachedUser = JSON.parse(raw) as { role?: string };
          if (cachedUser.role !== 'recruiter' && cachedUser.role !== 'candidate') {
            await clearSession();
            return setInitialRoute('Welcome');
          }

          try {
            const user = await getCurrentUserApi();
            await SecureStore.setItemAsync('auth_user', JSON.stringify({
              userId: user.id,
              email: user.email,
              role: user.role,
            }));
            setInitialRoute(user.role === 'recruiter' ? 'HrTabs' : 'CandidateTabs');
          } catch (error) {
            // apiRequest already clears an invalid token on 401. A temporary
            // network failure must not destroy an otherwise recoverable session.
            if (error instanceof ApiError && error.status === 401) {
              return setInitialRoute('Welcome');
            }
            setInitialRoute(cachedUser.role === 'recruiter' ? 'HrTabs' : 'CandidateTabs');
          }
        } catch {
          await clearSession();
          setInitialRoute('Welcome');
        }
      }).catch(() => setInitialRoute('Welcome'));
  }, []);
  if (!initialRoute) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator /></View>;
  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerTintColor: colors.light.brand.primary,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.light.background.primary },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CandidateTabs" component={CandidateTabs} options={{ headerShown: false }} />
      <Stack.Screen name="HrTabs" component={HrTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="HrCreateJob"
        component={HrCreateJobScreen}
        options={({ navigation }) => ({
          headerBackVisible: false,
          headerBackTitle: 'Công việc',
          headerLeft: () => (
            <Pressable
              accessibilityLabel="Quay lại màn hình Công việc"
              accessibilityRole="button"
              hitSlop={4}
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [styles.headerBackButton, pressed && styles.headerBackButtonPressed]}
            >
              <Ionicons color={colors.light.brand.secondary} name="chevron-back" size={27} />
            </Pressable>
          ),
          presentation: 'fullScreenModal',
          headerTitleAlign: 'center',
          title: 'Đăng tin tuyển dụng',
        })}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerBackButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  headerBackButtonPressed: { opacity: 0.55 },
});
