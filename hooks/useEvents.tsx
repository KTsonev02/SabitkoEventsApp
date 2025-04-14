import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../configs/FirebaseConfig'; // пътя зависи от структурата ти

export function useEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      const querySnapshot = await getDocs(collection(db, 'events'));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(data);
      setLoading(false);
    }

    fetchEvents();
  }, []);

  return { events, loading };
}
