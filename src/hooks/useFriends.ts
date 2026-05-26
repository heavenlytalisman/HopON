import { useState } from 'react';
import { searchUsersByHandle, sendFriendRequest } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import type { Friend } from '../types';

export function useFriends() {
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { firebaseUser } = useAuth();

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

  return { searchResults, isSearching, search, sendRequest };
}
