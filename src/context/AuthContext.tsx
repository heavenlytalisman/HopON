import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getUserProfile, loginAnonymously, updateUserPushToken } from '../services/firebase';
import { registerForPushNotificationsAsync } from '../services/notifications';
import type { User } from '../types';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  profile: User | null;
  isLoading: boolean;
  login: (nickname: string) => Promise<void>;
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
        setProfile(data);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

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

  const logout = async () => {
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
    <AuthContext.Provider value={{ firebaseUser, profile, isLoading, login, logout, refreshProfile }}>
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
