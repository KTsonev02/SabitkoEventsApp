import { useState, useEffect } from 'react';
import { db } from '../../configs/FirebaseConfig';
import { collection, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { Alert, Button, TextInput, View } from 'react-native';

type EventFormProps = {
  mode: 'create' | 'edit';
  eventId?: string;
  onSuccess?: () => void;
};

export default function EventForm({ mode = 'create', eventId, onSuccess }: EventFormProps) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Зареждане на данни при edit режим
  useEffect(() => {
    if (mode === 'edit' && eventId) {
      const loadEvent = async () => {
        const docRef = doc(db, 'events', eventId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title);
          // Задаване на другите полета...
        }
      };
      loadEvent();
    }
  }, [mode, eventId]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (mode === 'create') {
        await setDoc(doc(collection(db, 'events')), {
          title,
          createdAt: Timestamp.now()
        });
        Alert.alert('Успех', 'Събитието е създадено!');
      } else if (eventId) {
        await setDoc(doc(db, 'events', eventId), {
          title,
          updatedAt: Timestamp.now()
        }, { merge: true });
        Alert.alert('Успех', 'Събитието е обновено!');
      }
      
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    // Вашата форма...
    <View>
      <TextInput value={title} onChangeText={setTitle} />
      <Button 
        title={mode === 'create' ? 'Създай' : 'Запази'} 
        onPress={handleSubmit} 
      />
    </View>
  );
}