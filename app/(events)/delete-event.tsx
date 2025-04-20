// src/api/deleteEvent.ts
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../configs/FirebaseConfig';

export const deleteEvent = async (eventId: string): Promise<void> => {
  const eventRef = doc(db, 'events', eventId);
  await deleteDoc(eventRef);
};