import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import DashboardScreen from './screens/DashboardScreen';
import FriendsScreen from './screens/FriendsScreen';
import ProfileScreen from './screens/ProfileScreen';
import SquadDetailScreen from './screens/SquadDetailScreen';
import CreateSquadScreen from './screens/CreateSquadScreen';

import * as Notifications from 'expo-notifications';

import HopOnRoomScreen from './screens/HopOnRoomScreen';
import IncomingAlertScreen from './screens/IncomingAlertScreen';

import { FeedIcon, SquadIcon, UsersIcon } from './components/CustomIcons';
import { auth } from './firebaseConfig';
import { getUserProfile } from './services/FirebaseService';

function HeaderProfileButton() {
  const navigation = useNavigation();
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    async function loadAvatar() {
      if (auth.currentUser) {
        const profile = await getUserProfile(auth.currentUser.uid);
        if (profile?.avatar) {
          setAvatar(profile.avatar);
        }
      }
    }
    loadAvatar();
  }, []);

  return (
    <TouchableOpacity 
      style={styles.headerProfileContainer} 
      onPress={() => navigation.navigate('Profile')}
    >
      {avatar ? (
        <Image source={{ uri: avatar }} style={styles.headerProfilePic} />
      ) : (
        <View style={styles.headerProfilePic} />
      )}
    </TouchableOpacity>
  );
}

// Ensure notifications show up even when the app is active
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#FFFFFF', shadowColor: '#E2E8F0', elevation: 2 },
        headerTintColor: '#1E293B',
        headerTitleStyle: { fontWeight: 'bold' },
        headerRight: () => <HeaderProfileButton />,
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
    <SafeAreaProvider>
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
        <Stack.Screen 
          name="CreateSquad" 
          component={CreateSquadScreen} 
          options={{ presentation: 'modal' }} 
        />
        <Stack.Screen 
          name="HopOnRoom" 
          component={HopOnRoomScreen}
          options={{ presentation: 'fullScreenModal' }}
        />
        <Stack.Screen 
          name="IncomingAlert" 
          component={IncomingAlertScreen}
          options={{ presentation: 'fullScreenModal', animation: 'fade' }}
        />
      </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
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
