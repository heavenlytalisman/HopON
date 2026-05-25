import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';

// Screens
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import DashboardScreen from './screens/DashboardScreen';
import FriendsScreen from './screens/FriendsScreen';
import ProfileScreen from './screens/ProfileScreen';
import SquadDetailScreen from './screens/SquadDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#313338', shadowColor: 'transparent', elevation: 0 },
        headerTintColor: '#F2F3F5',
        headerTitleStyle: { fontWeight: 'bold' },
        headerRight: () => (
          <TouchableOpacity style={styles.headerProfileContainer} onPress={() => navigation.navigate('Profile')}>
            <View style={styles.headerProfilePic} />
          </TouchableOpacity>
        ),
        tabBarStyle: { backgroundColor: '#2B2D31', borderTopWidth: 0, elevation: 0 },
        tabBarActiveTintColor: '#F2F3F5',
        tabBarInactiveTintColor: '#80848E',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Friends" 
        component={FriendsScreen} 
        options={{ title: 'Friends' }}
      />
      <Tab.Screen 
        name="Squads" 
        component={DashboardScreen} 
        options={{ title: 'Squads' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="SquadDetail" component={SquadDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerProfileContainer: {
    marginRight: 16,
  },
  headerProfilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#5865F2', // Blurple placeholder
  }
});
