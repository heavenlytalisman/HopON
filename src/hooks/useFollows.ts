import { useState, useCallback } from 'react';
import { followUser, unfollowUser, getFollowers, getFollowing, checkIsFollowing, subscribeToFollowers, subscribeToFollowing } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import type { User } from '../types';

export function useFollows() {
  const { firebaseUser } = useAuth();
  const { showToast } = useUI();
  const [loading, setLoading] = useState(false);

  const follow = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!firebaseUser) return false;
    setLoading(true);
    const success = await followUser(firebaseUser.uid, targetUserId);
    setLoading(false);
    if (success) {
      showToast({ title: 'Success', message: 'Followed user successfully', type: 'success' });
    } else {
      showToast({ title: 'Error', message: 'Failed to follow user', type: 'error' });
    }
    return success;
  }, [firebaseUser, showToast]);

  const unfollow = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!firebaseUser) return false;
    setLoading(true);
    const success = await unfollowUser(firebaseUser.uid, targetUserId);
    setLoading(false);
    if (success) {
      showToast({ title: 'Success', message: 'Unfollowed user successfully', type: 'success' });
    } else {
      showToast({ title: 'Error', message: 'Failed to unfollow user', type: 'error' });
    }
    return success;
  }, [firebaseUser, showToast]);

  const fetchFollowers = useCallback(async (userId: string): Promise<User[]> => {
    setLoading(true);
    const followers = await getFollowers(userId);
    setLoading(false);
    return followers;
  }, []);

  const fetchFollowing = useCallback(async (userId: string): Promise<User[]> => {
    setLoading(true);
    const following = await getFollowing(userId);
    setLoading(false);
    return following;
  }, []);
  
  const isFollowingUser = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!firebaseUser) return false;
    return await checkIsFollowing(firebaseUser.uid, targetUserId);
  }, [firebaseUser]);

  return { follow, unfollow, fetchFollowers, fetchFollowing, subscribeToFollowers, subscribeToFollowing, isFollowingUser, loading };
}
