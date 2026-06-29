import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppState } from 'react-native';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getUserProfile, loginAnonymously, updateUserPushToken, loginWithEmail, registerWithEmail, updateUserPresence, updateUserProfile } from '../services/firebase';
import { registerForPushNotificationsAsync } from '../services/notifications';
import type { User } from '../types';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  profile: User | null;
  isLoading: boolean;
  login: (nickname: string) => Promise<void>;
  loginEmail: (email: string, pass: string) => Promise<void>;
  registerEmail: (email: string, pass: string, handle: string, nickname: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const data = await getUserProfile(user.uid);
        if (data && !data.handle && data.nickname) {
          const newHandle = data.nickname.toLowerCase().replace(/\s+/g, '');
          await updateUserProfile(user.uid, { handle: newHandle });
          data.handle = newHandle;
        }
        setProfile(data);
        await updateUserPresence(user.uid, true);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (firebaseUser) {
        if (nextAppState === 'active') {
          await updateUserPresence(firebaseUser.uid, true);
        } else if (nextAppState === 'background' || nextAppState === 'inactive') {
          await updateUserPresence(firebaseUser.uid, false);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [firebaseUser]);

  const login = async (nickname: string) => {
    const user = await loginAnonymously(nickname);

    // Register push token
    const token = await registerForPushNotificationsAsync();
    if (token) {
      await updateUserPushToken(user.uid, token);
    }

    // Load profile
    const data = await getUserProfile(user.uid);
    setProfile(data);
  };

  const loginEmail = async (email: string, pass: string) => {
    const user = await loginWithEmail(email, pass);
    const token = await registerForPushNotificationsAsync();
    if (token) {
      await updateUserPushToken(user.uid, token);
    }
    const data = await getUserProfile(user.uid);
    setProfile(data);
  };

  const registerEmail = async (email: string, pass: string, handle: string, nickname: string) => {
    const user = await registerWithEmail(email, pass, handle, nickname);
    const token = await registerForPushNotificationsAsync();
    if (token) {
      await updateUserPushToken(user.uid, token);
    }
    const data = await getUserProfile(user.uid);
    setProfile(data);
  };

  const logout = async () => {
    if (firebaseUser) {
      await updateUserPresence(firebaseUser.uid, false);
    }
    await auth.signOut();
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (firebaseUser) {
      const data = await getUserProfile(firebaseUser.uid);
      setProfile(data);
    }
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, profile, isLoading, login, loginEmail, registerEmail, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
