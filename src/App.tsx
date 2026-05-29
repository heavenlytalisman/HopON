import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <UIProvider>
          <NavigationContainer theme={DarkTheme}>
            <StatusBar style="light" />
            <AppNavigator />
          </NavigationContainer>
        </UIProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
