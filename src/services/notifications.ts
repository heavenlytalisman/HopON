import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
  let token: string | null = null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        (Constants as any)?.easConfig?.projectId;

      if (!projectId) {
        console.warn('Project ID not found. Ensure app.json is configured correctly.');
      }

      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: projectId,
        })
      ).data;
      console.log('Expo Push Token generated:', token);
    } catch (e) {
      console.error('Error generating Expo Push Token:', e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
};

export const sendPushNotification = async (
  expoPushToken: string,
  title: string,
  body: string,
  data?: Record<string, unknown>,
): Promise<void> => {
  if (!expoPushToken) {
    console.log('No push token provided.');
    return;
  }

  try {
    const notificationRequestsRef = collection(db, 'notification_requests');
    await addDoc(notificationRequestsRef, {
      token: expoPushToken,
      title,
      body,
      data: data || {},
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    console.log('Push notification request created successfully.');
  } catch (error) {
    console.error('Error creating push notification request:', error);
  }
};
