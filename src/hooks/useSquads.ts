import { useState, useEffect } from 'react';
import { subscribeToUserGroups, createGroup } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import type { Group } from '../types';



export function useSquads() {
  const [squads, setSquads] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const { firebaseUser } = useAuth();

  useEffect(() => {
    if (!firebaseUser) {
      setSquads([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToUserGroups(firebaseUser.uid, (groups) => {
      setSquads(groups);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseUser]);

  const loadSquads = async () => {
    // Left for backwards compatibility if any component calls refreshSquads
    // though the real-time listener will handle updates automatically
  };

  const createSquad = async (name: string): Promise<string | null> => {
    if (!firebaseUser) return null;
    try {
      const groupId = await createGroup(name, firebaseUser.uid);
      await loadSquads(); // Refresh the list
      return groupId;
    } catch (error) {
      console.error('Error creating squad:', error);
      return null;
    }
  };

  return { squads, loading, createSquad, refreshSquads: loadSquads };
}
