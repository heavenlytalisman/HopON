import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDz5-IddLxqcLHmEBTsRXehS5s6hIrOW70",
  authDomain: "hopon-48671.firebaseapp.com",
  projectId: "hopon-48671",
  storageBucket: "hopon-48671.firebasestorage.app",
  messagingSenderId: "844079218774",
  appId: "1:844079218774:web:cb466c4832dd4a7725bbf7"
};

let app, auth;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} else {
  app = getApp();
  auth = getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db };
