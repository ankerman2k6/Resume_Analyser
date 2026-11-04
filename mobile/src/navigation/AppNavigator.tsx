import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { RegisterScreen } from '../features/auth/screens/RegisterScreen';
import { WelcomeScreen } from '../features/auth/screens/WelcomeScreen';
import { CandidateJobDetailScreen } from '../features/candidate/jobs/screens/CandidateJobDetailScreen';
import { colors } from '../theme';
import { CandidateTabs } from './CandidateTabs';
import { HrTabs } from './HrTabs';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { clearSession } from '../core/apiClient';
import { HrCreateJobScreen } from '../features/hr/jobs/screens/HrCreateJobScreen';
const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    clearSession().finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.light.brand.secondary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName="Welcome"
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
      <Stack.Screen
        name="CandidateJobDetail"
        component={CandidateJobDetailScreen}
        options={{ headerShown: false }}
      />
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
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerBackButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  headerBackButtonPressed: { opacity: 0.55 },
});
