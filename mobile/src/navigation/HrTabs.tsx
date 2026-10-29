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
    HrInterviewsScreen,
} from '../features/hr/interviews/screens/HrInterviewsScreen';
import {
    HrSettingsScreen,
} from '../features/hr/settings/screens/HrSettingsScreen';
import { colors } from '../theme';

const Tab =
    createBottomTabNavigator<HrTabParamList>();

const tabIcons = {
    HrDashboard: 'grid-outline',
    HrApplications: 'people-outline',
    HrInterviews: 'calendar-outline',
    HrSettings: 'settings-outline',
} as const;

export function HrTabs() {
    return (
        <Tab.Navigator
            initialRouteName="HrDashboard"
            screenOptions={({ route }) => ({
                headerTitleAlign: 'center',
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
                    title: 'Ứng viên',
                    tabBarLabel: 'Ứng viên',
                }}
            />

            <Tab.Screen
                name="HrInterviews"
                component={HrInterviewsScreen}
                options={{
                    title: 'Phỏng vấn',
                    tabBarLabel: 'Phỏng vấn',
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
    );
}