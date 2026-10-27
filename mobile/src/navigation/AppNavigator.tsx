import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { CandidateTabs } from './CandidateTabs';
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { RegisterScreen } from '../features/auth/screens/RegisterScreen';
import { JobDetailScreen } from '../features/jobs/screens/JobDetailScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerTintColor: colors.light.brand.primary,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.light.background.primary },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Tạo tài khoản' }} />
      <Stack.Screen name="CandidateTabs" component={CandidateTabs} options={{ headerShown: false }} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} options={{ title: 'Chi tiết việc làm' }} />
    </Stack.Navigator>
  );
}
