import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import { getUserProfile, updateUserProfile } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';

export function useProfile() {
  const { firebaseUser, refreshProfile } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [firebaseUser]);

  const loadProfile = async () => {
    if (!firebaseUser) return;
    try {
      const data = await getUserProfile(firebaseUser.uid);
      if (data) setProfile(data);
    } catch (error) {
      console.error('Failed to load profile', error);
    } finally {
      setLoading(false);
    }
  };

  const updateNickname = async (newNickname: string): Promise<boolean> => {
    if (!firebaseUser) return false;
    const trimmed = newNickname.trim();
    if (!trimmed) return false;

    const newHandle = `@${trimmed.toLowerCase().replace(/\s+/g, '')}`;
    const success = await updateUserProfile(firebaseUser.uid, {
      nickname: trimmed,
      handle: newHandle,
    } as Partial<User>);

    if (success) {
      setProfile((prev) => prev ? { ...prev, nickname: trimmed, handle: newHandle } : prev);
      await refreshProfile();
    }
    return success;
  };

  const updateAvatar = async (imageUri: string): Promise<boolean> => {
    if (!firebaseUser) return false;
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const fileRef = ref(storage, `avatars/${firebaseUser.uid}`);

      await uploadBytes(fileRef, blob);
      const downloadURL = await getDownloadURL(fileRef);

      const success = await updateUserProfile(firebaseUser.uid, { avatar: downloadURL } as Partial<User>);
      if (success) {
        setProfile((prev) => prev ? { ...prev, avatar: downloadURL } : prev);
        await refreshProfile();
      }
      return success;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Error', 'Failed to save avatar.');
      return false;
    }
  };

  const updateProfileDetails = async (details: { nickname?: string; handle?: string; bio?: string; bannerUri?: string }): Promise<boolean> => {
    if (!firebaseUser) return false;
    
    try {
      const updates: Partial<User> = {};
      
      if (details.nickname && details.nickname.trim() !== '') {
        updates.nickname = details.nickname.trim();
      }
      
      if (details.handle && details.handle.trim() !== '') {
        let newHandle = details.handle.trim().toLowerCase().replace(/\s+/g, '');
        if (!newHandle.startsWith('@')) {
          newHandle = `@${newHandle}`;
        }
        updates.handle = newHandle;
      }
      
      if (details.bio !== undefined) {
        updates.bio = details.bio.trim();
      }

      if (details.bannerUri) {
        // Upload banner to Firebase Storage
        const response = await fetch(details.bannerUri);
        const blob = await response.blob();
        const fileRef = ref(storage, `banners/${firebaseUser.uid}`);
        await uploadBytes(fileRef, blob);
        const downloadURL = await getDownloadURL(fileRef);
        updates.banner = downloadURL;
      }

      if (Object.keys(updates).length > 0) {
        const success = await updateUserProfile(firebaseUser.uid, updates);
        if (success) {
          setProfile((prev) => prev ? { ...prev, ...updates } : prev);
          await refreshProfile();
        }
        return success;
      }
      
      return true;
    } catch (error) {
      console.error('Error updating profile details:', error);
      Alert.alert('Error', 'Failed to update profile details.');
      return false;
    }
  };

  const getHandle = (): string => {
    if (profile?.handle) return profile.handle;
    return `@${(profile?.nickname || 'user').toLowerCase().replace(/\s+/g, '')}`;
  };

  return { profile, loading, updateNickname, updateAvatar, updateProfileDetails, getHandle, refreshProfile: loadProfile };
}
