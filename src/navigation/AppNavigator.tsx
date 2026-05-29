import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import FeedIcon from '../components/icons/FeedIcon';
import LoginScreen from '../screens/auth/LoginScreen';
import DashboardHomeScreen from '../screens/home/DashboardScreen';
import FeedScreen from '../screens/feed/FeedScreen';
import SquadsScreen from '../screens/squads/DashboardScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

import SquadDetailScreen from '../screens/squads/SquadDetailScreen';
import SquadEditScreen from '../screens/squads/SquadEditScreen';
import CreateSquadScreen from '../screens/squads/CreateSquadScreen';
import HopOnRoomScreen from '../screens/squads/HopOnRoomScreen';
import SquadSettingsScreen from '../screens/squads/SquadSettingsScreen';
import IncomingAlertScreen from '../screens/squads/IncomingAlertScreen';
import QuickSquadSelectScreen from '../screens/squads/QuickSquadSelectScreen';
import FriendProfileScreen from '../screens/profile/FriendProfileScreen';
import FriendListScreen from '../screens/profile/FriendListScreen';
import FollowListScreen from '../screens/profile/FollowListScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import QRScannerScreen from '../screens/squads/QRScannerScreen';
import PostDetailScreen from '../screens/feed/PostDetailScreen';
import RecentActivityScreen from '../screens/home/RecentActivityScreen';

import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/theme';
import type { RootStackParamList, MainTabParamList } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Dummy component for the center button
const NullScreen = () => null;

function MainTabs() {
  const navigation = useNavigation<any>();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { 
          backgroundColor: '#0B0D17', 
          borderTopWidth: 1, 
          borderTopColor: '#1E293B', 
          elevation: 10, 
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10, 
          paddingTop: 10 
        },
        tabBarActiveTintColor: '#A78BFA',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: { fontWeight: '600', fontSize: 10, marginTop: 4 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardHomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Squads"
        component={SquadsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="people" color={color} size={size} />,
        }}
      />
      
      <Tab.Screen
        name="HopOnAction"
        component={NullScreen}
        options={{
          title: 'HOP ON',
          tabBarIcon: () => (
            <View style={styles.fabContainer}>
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                style={styles.fabGradient}
              >
                <Ionicons name="flash" size={24} color="#FFF" />
              </LinearGradient>
              <View style={styles.fabGlow} />
            </View>
          ),
          tabBarLabelStyle: {
            color: '#FFFFFF',
            fontSize: 10,
            fontWeight: 'bold',
            marginTop: 20, // push label down because FAB is big
          }
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            // Open Quick Squad Select Modal
            navigation.navigate('QuickSquadSelect');
          },
        }}
      />

      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarIcon: ({ color, size }) => <FeedIcon color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      {/* Profile is now in tabs, but we might keep the stack screen if accessed from other places */}
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="FriendList" component={FriendListScreen} />
      <Stack.Screen name="FollowList" component={FollowListScreen} />
      <Stack.Screen name="SquadDetail" component={SquadDetailScreen} />
      <Stack.Screen name="SquadEdit" component={SquadEditScreen} />
      <Stack.Screen name="SquadSettings" component={SquadSettingsScreen} />
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
      <Stack.Screen
        name="QuickSquadSelect"
        component={QuickSquadSelectScreen}
        options={{ presentation: 'transparentModal', animation: 'fade' }}
      />
      <Stack.Screen
        name="QRScanner"
        component={QRScannerScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
      <Stack.Screen name="FriendProfile" component={FriendProfileScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="RecentActivity" component={RecentActivityScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    top: -15,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    borderWidth: 2,
    borderColor: '#0B0D17',
  },
  fabGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7C3AED',
    opacity: 0.5,
    zIndex: 1,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 10,
  }
});
