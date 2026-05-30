import { useState, useEffect } from 'react';
import { subscribeToNotifications } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { firebaseUser } = useAuth();

  useEffect(() => {
    if (!firebaseUser) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToNotifications(firebaseUser.uid, (data) => {
      setNotifications(data);
      setLoading(false);
    }, (error) => {
      setNotifications([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseUser]);

  return { notifications, loading };
}
