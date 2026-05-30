import { useState, useEffect } from 'react';
import { searchUsersByHandle, sendFriendRequest, getFriends } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import type { User, Friend } from '../types';

export function useFriends() {
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [friends, setFriends] = useState<User[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const { firebaseUser } = useAuth();

  useEffect(() => {
    loadFriends();
  }, [firebaseUser]);

  const loadFriends = async () => {
    if (!firebaseUser) return;
    setLoadingFriends(true);
    try {
      const f = await getFriends(firebaseUser.uid);
      setFriends(f);
    } catch (e) {
      console.error(e);
      setFriends([]);
    } finally {
      setLoadingFriends(false);
    }
  };

  const search = async (text: string) => {
    if (text.length > 2) {
      setIsSearching(true);
      const results = await searchUsersByHandle(text);
      setSearchResults(
        results.map((u) => ({
          id: (u as any).id || u.uid,
          nickname: u.nickname,
          handle: u.handle,
          avatar: u.avatar,
        })),
      );
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  const sendRequest = async (userId: string): Promise<boolean> => {
    if (!firebaseUser) return false;
    return sendFriendRequest(firebaseUser.uid, userId);
  };

  return { friends, loadingFriends, searchResults, isSearching, search, sendRequest, refreshFriends: loadFriends };
}
