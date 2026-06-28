import { useState, useEffect } from 'react';
import { uploadToCloudinary } from '../services/cloudinary';
import { getUserProfile, updateUserProfile, subscribeToUserProfile } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import type { User } from '../types';

export function useProfile() {
  const { firebaseUser, refreshProfile } = useAuth();
  const { showToast } = useUI();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToUserProfile(firebaseUser.uid, (data) => {
      if (data) setProfile(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseUser]);

  const loadProfile = async () => {
    if (!firebaseUser) return;
    try {
      const data = await getUserProfile(firebaseUser.uid);
      if (data) setProfile(data);
    } catch (error) {
      console.error('Failed to load profile', error);
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
      const downloadURL = await uploadToCloudinary(imageUri);

      const success = await updateUserProfile(firebaseUser.uid, { avatar: downloadURL } as Partial<User>);
      if (success) {
        setProfile((prev) => prev ? { ...prev, avatar: downloadURL } : prev);
        await refreshProfile();
        showToast({ title: 'Success', message: 'Avatar updated successfully', type: 'success' });
      }
      return success;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      showToast({ title: 'Error', message: 'Failed to save avatar.', type: 'error' });
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
        // Upload banner to Cloudinary
        const downloadURL = await uploadToCloudinary(details.bannerUri);
        updates.banner = downloadURL;
      }

      if (Object.keys(updates).length > 0) {
        const success = await updateUserProfile(firebaseUser.uid, updates);
        if (success) {
          setProfile((prev) => prev ? { ...prev, ...updates } : prev);
          await refreshProfile();
          showToast({ title: 'Success', message: 'Profile updated successfully', type: 'success' });
        }
        return success;
      }
      
      return true;
    } catch (error) {
      console.error('Error updating profile details:', error);
      showToast({ title: 'Error', message: 'Failed to update profile details.', type: 'error' });
      return false;
    }
  };

  const getHandle = (): string => {
    if (profile?.handle) return profile.handle;
    return `@${(profile?.nickname || 'user').toLowerCase().replace(/\s+/g, '')}`;
  };

  return { profile, loading, updateNickname, updateAvatar, updateProfileDetails, getHandle, refreshProfile: loadProfile };
}
