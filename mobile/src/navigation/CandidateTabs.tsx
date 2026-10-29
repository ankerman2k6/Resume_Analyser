import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { CandidateTabParamList } from '../types/navigation';
import { CandidateJobsScreen } from '../features/candidate/jobs/screens/CandidateJobsScreen';
import { CandidateResumesScreen } from '../features/candidate/resumes/screens/CandidateResumesScreen';
import { CandidateProfileScreen } from '../features/candidate/profile/screens/CandidateProfileScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator<CandidateTabParamList>();

const tabIcons = {
  CandidateJobs: 'briefcase-outline',
  CandidateResumes: 'document-text-outline',
  CandidateProfile: 'person-outline',
} as const;

export function CandidateTabs() {
  return (
    <Tab.Navigator
      initialRouteName="CandidateJobs"
      screenOptions={({ route }) => ({
        headerTitleAlign: 'center',
        tabBarActiveTintColor: colors.light.brand.secondary,
        tabBarInactiveTintColor: colors.light.text.secondary,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: colors.light.border.subtle,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
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
          title: 'Hồ sơ CV',
          tabBarLabel: 'CV',
        }}
      />

      <Tab.Screen
        name="CandidateProfile"
        component={CandidateProfileScreen}
        options={{
          title: 'Cá nhân',
          tabBarLabel: 'Cá nhân',
        }}
      />
    </Tab.Navigator>
  );
}
