import { Ionicons } from '@expo/vector-icons';
import {
    createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import type {
    HrTabParamList,
} from '../types/navigation';
import {
    HrDashboardScreen,
} from '../features/hr/dashboard/screens/HrDashboardScreen';
import {
    HrApplicationsScreen,
} from '../features/hr/applications/screens/HrApplicationsScreen';
import {
    HrSettingsScreen,
} from '../features/hr/settings/screens/HrSettingsScreen';
import { colors } from '../theme';
import { HrJobsScreen } from '../features/hr/jobs/screens/HrJobsScreen';
import {
    FloatingIslandTabBar,
    FloatingTabBarProvider,
} from './components/FloatingIslandTabBar';

const Tab =
    createBottomTabNavigator<HrTabParamList>();

const tabIcons = {
    HrDashboard: 'grid-outline',
    HrJobs: 'briefcase-outline',
    HrApplications: 'people-outline',
    HrSettings: 'settings-outline',
} as const;

export function HrTabs() {
    return (
        <FloatingTabBarProvider>
            <Tab.Navigator
                initialRouteName="HrDashboard"
                tabBar={(props) => <FloatingIslandTabBar {...props} />}
                screenOptions={({ route }) => ({
                    headerTitleAlign: 'center',
                    headerShown: route.name !== 'HrDashboard',
                    tabBarHideOnKeyboard: true,
                    tabBarActiveTintColor:
                        colors.light.brand.secondary,
                    tabBarInactiveTintColor:
                        colors.light.text.secondary,
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
                name="HrJobs"
                component={HrJobsScreen}
                options={{
                    title: 'Tin tuyển dụng',
                    tabBarLabel: 'Công việc',
                }}
            />
            <Tab.Screen
                name="HrDashboard"
                component={HrDashboardScreen}
                options={{
                    title: 'Tổng quan',
                    tabBarLabel: 'Tổng quan',
                }}
            />

            <Tab.Screen
                name="HrApplications"
                component={HrApplicationsScreen}
                options={{
                    headerShown: false,
                    title: 'Ứng viên',
                    tabBarLabel: 'Ứng viên',
                }}
            />

            <Tab.Screen
                name="HrSettings"
                component={HrSettingsScreen}
                options={{
                    title: 'Cài đặt',
                    tabBarLabel: 'Cài đặt',
                }}
            />
            </Tab.Navigator>
        </FloatingTabBarProvider>
    );
}
