import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { RegisterScreen } from '../features/auth/screens/RegisterScreen';
import { WelcomeScreen } from '../features/auth/screens/WelcomeScreen';
import { CandidateJobDetailScreen } from '../features/candidate/jobs/screens/CandidateJobDetailScreen';
import { colors } from '../theme';
import { CandidateTabs } from './CandidateTabs';
import { HrTabs } from './HrTabs';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
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
      <Stack.Screen name="HrTabs" component={HrTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="CandidateJobDetail"
        component={CandidateJobDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
