import { useRouter, useLocalSearchParams } from 'expo-router';
import { db } from '../../../configs/FirebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useState, useEffect, useCallback } from 'react';
import { Text, TextInput, View, Button, StyleSheet, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';

interface Event {
  title: string;
  date: Date;
  location: string;
  description: string;
}

export default function EditEvent() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams();
  const [event, setEvent] = useState<Event>({
    title: '',
    date: new Date(),
    location: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const fetchEvent = async () => {
    if (!eventId) return;
    try {
      const docRef = doc(db, 'events', eventId as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setEvent({
          title: data.title,
          date: data.date.toDate ? data.date.toDate() : new Date(data.date),
          location: data.location,
          description: data.description,
        });
      } else {
        Alert.alert('Грешка', 'Събитието не беше намерено');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      Alert.alert('Грешка', 'Неуспешно зареждане на събитие');
    } finally {
      setLoading(false);
    }
  };

  // Зарежда се при всяко фокусиране на страницата (рефреш)
  useFocusEffect(
    useCallback(() => {
      fetchEvent();
    }, [eventId])
  );

  const handleUpdateEvent = async () => {
    try {
      const docRef = doc(db, 'events', eventId as string);
      await updateDoc(docRef, {
        title: event.title,
        date: event.date,
        location: event.location,
        description: event.description,
      });
      Alert.alert('Успешно', 'Събитието беше обновено', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error updating event:', error);
      Alert.alert('Грешка', 'Неуспешно обновяване на събитие');
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Зареждам...</Text>
      ) : (
        <View style={styles.form}>
          <Text style={styles.label}>Заглавие:</Text>
          <TextInput
            style={styles.input}
            value={event.title}
            onChangeText={(text) => setEvent({ ...event, title: text })}
          />

          <Text style={styles.label}>Дата:</Text>
          <Button title={event.date.toDateString()} onPress={() => setShowDatePicker(true)} />
          {showDatePicker && (
            <DateTimePicker
              value={event.date}
              mode="date"
              display="default"
              onChange={(eventChange, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setEvent({ ...event, date: selectedDate });
                }
              }}
            />
          )}

          <Text style={styles.label}>Локация:</Text>
          <TextInput
            style={styles.input}
            value={event.location}
            onChangeText={(text) => setEvent({ ...event, location: text })}
          />

          <Text style={styles.label}>Описание:</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            multiline
            value={event.description}
            onChangeText={(text) => setEvent({ ...event, description: text })}
          />

          <Button title="Обнови събитието" onPress={handleUpdateEvent} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  form: {
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    fontSize: 16,
    borderRadius: 8,
  },
});
