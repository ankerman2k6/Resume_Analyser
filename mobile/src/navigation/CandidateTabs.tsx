import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { CandidateTabParamList } from '../types/navigation';
import { HomeScreen } from '../features/hr/dashboard/screens/HomeScreen';
import { ApplicationsScreen } from '../features/hr/applications/screens/ApplicationsScreen';
import { ProfileScreen } from '../features/candidate/profile/screens/ProfileScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator<CandidateTabParamList>();

export function CandidateTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: colors.light.brand.secondary,
        tabBarInactiveTintColor: colors.light.text.secondary,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Việc làm' }} />
      <Tab.Screen name="Applications" component={ApplicationsScreen} options={{ title: 'Đơn ứng tuyển' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Hồ sơ' }} />
    </Tab.Navigator>
  );
}
