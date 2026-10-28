import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AppDataProvider } from './AppDataContext';
import { AppNavigator } from '../navigation/AppNavigator';

export default function App() {
  return (
    <AppDataProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <AppNavigator />
      </NavigationContainer>
    </AppDataProvider>
  );
}
