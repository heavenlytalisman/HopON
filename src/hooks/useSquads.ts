import { useState, useEffect } from 'react';
import { getUserGroups, createGroup } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import type { Group } from '../types';

const MOCK_SQUADS: Group[] = [
  { id: '1', name: 'valorant-comp', avatar: 'https://i.pravatar.cc/150?img=11', members: ['1','2','3','4','5','6','7','8','9','10','11','12'], online: 4 },
  { id: '2', name: 'apex-legends-casual', avatar: 'https://i.pravatar.cc/150?img=12', members: ['1','2','3'], online: 0 },
  { id: '3', name: 'announcements', avatar: 'https://i.pravatar.cc/150?img=13', members: Array(46).fill('x'), readOnly: true },
];

export function useSquads() {
  const [squads, setSquads] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const { firebaseUser } = useAuth();

  const loadSquads = async () => {
    if (!firebaseUser) return;
    setLoading(true);
    try {
      const userGroups = await getUserGroups(firebaseUser.uid);
      setSquads(userGroups.length > 0 ? userGroups : MOCK_SQUADS);
    } catch {
      setSquads(MOCK_SQUADS);
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
