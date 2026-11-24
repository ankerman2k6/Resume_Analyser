import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { CandidateTabParamList } from '../types/navigation';
import { CandidateJobsScreen } from '../features/candidate/jobs/screens/CandidateJobsScreen';
import { CandidateResumesScreen } from '../features/candidate/resumes/screens/CandidateResumesScreen';
import { CandidateProfileScreen } from '../features/candidate/profile/screens/CandidateProfileScreen';
import { colors } from '../theme';
import {
  FloatingIslandTabBar,
  FloatingTabBarProvider,
} from './components/FloatingIslandTabBar';

const Tab = createBottomTabNavigator<CandidateTabParamList>();

const tabIcons = {
  CandidateJobs: 'briefcase-outline',
  CandidateResumes: 'document-text-outline',
  CandidateProfile: 'person-outline',
} as const;

export function CandidateTabs() {
  return (
    <FloatingTabBarProvider>
      <Tab.Navigator
        initialRouteName="CandidateJobs"
        tabBar={(props) => <FloatingIslandTabBar {...props} />}
        screenOptions={({ route }) => ({
          headerTitleAlign: 'center',
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: colors.light.brand.secondary,
          tabBarInactiveTintColor: colors.light.text.secondary,
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              color={color}
              name={tabIcons[route.name]}
              size={size}
            />
          ),
        })}
      >
      <Tab.Screen
        name="CandidateJobs"
        component={CandidateJobsScreen}
        options={{
          headerShown: false,
          title: 'Việc làm',
          tabBarLabel: 'Việc làm',
        }}
      />

      <Tab.Screen
        name="CandidateResumes"
        component={CandidateResumesScreen}
        options={{
          headerShown: false,
          title: 'Quản lý CV',
          tabBarLabel: 'Quản lý CV',
        }}
      />

      <Tab.Screen
        name="CandidateProfile"
        component={CandidateProfileScreen}
        options={{
          headerShown: false,
          title: 'Cá nhân',
          tabBarLabel: 'Cá nhân',
        }}
      />
      </Tab.Navigator>
    </FloatingTabBarProvider>
  );
}
