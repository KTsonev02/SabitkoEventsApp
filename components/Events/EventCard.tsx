import React, { useContext, useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AuthContext } from '@/context/AuthContext';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { router } from 'expo-router';
import { collection, query, where, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/configs/FirebaseConfig';
import Colors from '@/app/constants/Colors';
import { useRouter } from 'expo-router'; // Импортирай навигацията

// Тип за събитията (съвпада с Firestore структурата)
type EventData = {
  id: string;
  name: string;
  bannerUrl: string;
  location: string;
  link: string;
  eventDate: string; // Формат: "YYYY-MM-DD"
  eventTime: string; // Формат: "HH:mm"
  email: string; // Имейл на организатора
  createdon: any; // Firestore Timestamp
  lat?: number; // Незадължително
  lon?: number; // Незадължително
  category: string;
};

const EventCard = ({ event, hideDetailsButton = false }: { event: EventData; hideDetailsButton?: boolean }) => {
    const { user } = useContext(AuthContext);
    const [isRegistered, setIsRegistered] = useState(false);
    const [loading, setLoading] = useState(false);
  
    useEffect(() => {
      const checkRegistration = async () => {
        if (!user?.email) return;
  
        try {
          const registrationsRef = collection(db, 'event_registrations');
          const q = query(
            registrationsRef,
            where('eventId', '==', event.id),
            where('userEmail', '==', user.email)
          );
          const snapshot = await getDocs(q);
          setIsRegistered(!snapshot.empty);
        } catch (error) {
          console.error('Error checking registration:', error);
        }
      };
  
      checkRegistration();
    }, [event.id, user?.email]);

  // 2. Регистрация/отписване
  const handleRegistration = async () => {
    if (!user?.email) {
      Alert.alert('Грешка', 'Трябва да сте влезли в системата');
      return;
    }

    setLoading(true);
    try {
      if (isRegistered) {
        // Отписване
        const q = query(
          collection(db, 'event_registrations'),
          where('eventId', '==', event.id),
          where('userEmail', '==', user.email)
        );
        const snapshot = await getDocs(q);
        snapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
        setIsRegistered(false);
        Alert.alert('Успех', 'Регистрацията е отменена');
      } else {
        // Регистрация
        await addDoc(collection(db, 'event_registrations'), {
          eventId: event.id,
          userEmail: user.email,
          registeredAt: new Date().toISOString()
        });
        setIsRegistered(true);
        Alert.alert('Успех', 'Успешна регистрация!');
      }
    } catch (error) {
      console.error('Грешка при регистрация:', error);
      Alert.alert('Грешка', 'Неуспешна операция');
    } finally {
      setLoading(false);
    }
  };

  // 3. Споделяне на събитие
  const shareEvent = async () => {
    try {
      const fileUri = FileSystem.documentDirectory + 'event_share.jpg';
      const { uri } = await FileSystem.downloadAsync(event.bannerUrl, fileUri);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          dialogTitle: `Сподели ${event.name}`,
          mimeType: 'image/jpeg',
        });
      } else {
        Alert.alert('Грешка', 'Функцията за споделяне не е налична');
      }
    } catch (error) {
      console.error('Грешка при споделяне:', error);
      Alert.alert('Грешка', 'Неуспешно споделяне');
    }
  };


  return (
    <View style={styles.container}>
      {/* Заглавна снимка */}
      <Image source={{ uri: event.bannerUrl }} style={styles.banner} />

      {/* Основна информация */}
      <Text style={styles.title}>{event.name}</Text>
      <Text style={styles.organizer}>Организатор: {event.email}</Text>
      <Text style={styles.category}>{event.category}</Text>

      {/* Дата и час */}
      <View style={styles.detailRow}>
        <Ionicons name="calendar-outline" size={16} color={Colors.PRIMARY} />
        <Text style={styles.detailText}>
          {new Date(event.eventDate).toLocaleDateString('bg-BG')} в {event.eventTime}
        </Text>
      </View>

      {/* Локация */}
      <View style={styles.detailRow}>
        <Ionicons name="location-outline" size={16} color={Colors.PRIMARY} />
        <Text style={styles.detailText}>{event.location}</Text>
      </View>


      {/* Бутони */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.shareButton]}
          onPress={shareEvent}
        >
          <Text style={styles.shareButtonText}>Сподели</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button, 
            isRegistered ? styles.unregisterButton : styles.registerButton
          ]}
          onPress={handleRegistration}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerButtonText}>
              {isRegistered ? 'Отмени' : 'Регистрирай се'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Бутон за редакция (ако потребителят е организатор) */}
      {!hideDetailsButton && (
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push(`../event/${event.id}`)} // Навигиране към динамичната страница
        > 
          <Text style={styles.editButtonText}>Виж детайли</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Стилове
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  banner: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  organizer: {
    fontSize: 14,
    color: 'gray',
    marginTop: 5,
  },
  category: {
    fontSize: 14,
    color: 'gray',
    marginTop: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  detailText: {
    marginLeft: 5,
  },
  buttonsContainer: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    margin: 5,
  },
  shareButton: {
    backgroundColor: Colors.GRAY,
  },
  shareButtonText: {
    textAlign: 'center',
    color: '#333',
  },
  registerButton: {
    backgroundColor: Colors.PRIMARY,
  },
  unregisterButton: {
    backgroundColor: Colors.SECONDARY,
  },
  registerButtonText: {
    textAlign: 'center',
    color: '#fff',
  },
  editButton: {
    marginTop: 20,
    backgroundColor: '#007BFF',
    borderRadius: 8,
    padding: 10,
  },
  editButtonText: {
    textAlign: 'center',
    color: '#fff',
  },
});

export default EventCard;
