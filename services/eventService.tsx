// services/eventService.js
import { collection, addDoc, Timestamp, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from 'configs/FirebaseConfig';


export interface EventData {
    id: string;
    name: string;
    bannerUrl: string;
    location: string;
    link: string;
    eventDate: string;
    eventTime: string;
    email: string;
    createdon: any;
    lat?: number;
    lon?: number;
    category: string;
  }


  export const createEvent = async (eventData: EventData) => {
    try {
      const docRef = await addDoc(collection(db, 'events'), {
        ...eventData,
        createdon: Timestamp.now()
      });
      console.log('Event created with ID: ', docRef.id);
      return docRef.id;
    } catch (e) {
      console.error('Error adding event:', e);
      throw e;
    }
  };

  export const fetchEvents = async (): Promise<EventData[]> => {
    try {
      const eventsCol = collection(db, 'events');
      const snapshot = await getDocs(eventsCol);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          bannerUrl: data.bannerUrl || '',
          location: data.location || '',
          link: data.link || '',
          eventDate: data.eventDate || '',
          eventTime: data.eventTime || '',
          email: data.email || '',
          createdon: data.createdon || null,
          lat: data.lat || undefined,
          lon: data.lon || undefined,
          category: data.category || ''
        } as EventData;
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  };