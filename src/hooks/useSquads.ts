import { useState, useEffect } from 'react';
import { getUserGroups, createGroup } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import type { Group } from '../types';



export function useSquads() {
  const [squads, setSquads] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const { firebaseUser } = useAuth();

  const loadSquads = async () => {
    if (!firebaseUser) return;
    setLoading(true);
    try {
      const userGroups = await getUserGroups(firebaseUser.uid);
      setSquads(userGroups);
    } catch {
      setSquads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSquads();
  }, [firebaseUser]);

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
