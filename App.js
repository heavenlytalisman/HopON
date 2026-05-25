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

import { FeedIcon, SquadIcon, UsersIcon } from './components/CustomIcons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#FFFFFF', shadowColor: '#E2E8F0', elevation: 2 },
        headerTintColor: '#1E293B',
        headerTitleStyle: { fontWeight: 'bold' },
        headerRight: () => (
          <TouchableOpacity style={styles.headerProfileContainer} onPress={() => navigation.navigate('Profile')}>
            <View style={styles.headerProfilePic} />
          </TouchableOpacity>
        ),
        tabBarStyle: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F1F5F9', elevation: 10, height: 65, paddingBottom: 10, paddingTop: 10 },
        tabBarActiveTintColor: '#2C5282',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: { fontWeight: '600', fontSize: 11, marginTop: 4 },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: 'Feed',
          tabBarIcon: ({ color, size }) => <FeedIcon color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Friends" 
        component={FriendsScreen} 
        options={{ 
          title: 'Friends',
          tabBarIcon: ({ color, size }) => <UsersIcon color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Squads" 
        component={DashboardScreen} 
        options={{ 
          title: 'Squads',
          tabBarIcon: ({ color, size }) => <SquadIcon color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
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
    backgroundColor: '#1E293B', // Dark avatar placeholder
  }
});
