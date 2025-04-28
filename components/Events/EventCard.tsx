import React, { useContext, useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AuthContext } from '@/context/AuthContext';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { router } from 'expo-router';
import Colors from '@/app/constants/Colors';

// Тип за събитията
type EventData = {
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
};

const EventCard = ({ event, hideDetailsButton = false }: { event: EventData; hideDetailsButton?: boolean }) => {
  const { user } = useContext(AuthContext);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   const checkRegistration = async () => {
  //     if (!user?.email) return;
  //     try {
  //       const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/event-register?email=${user.email}`);
  //       const data = await res.json();
  //       setIsRegistered(data.isRegistered); // очаква се бекендът да връща { isRegistered: true/false }
  //     } catch (error) {
  //       console.error('Error checking registration:', error);
  //     }
  //   };
  //   checkRegistration();
  // }, [event.id, user?.email]);

  // const handleRegistration = async () => {
  //   if (!user?.email) {
  //     Alert.alert('Грешка', 'Трябва да сте влезли в системата');
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     if (isRegistered) {
  //       const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/event-register?email=${user.email}&eventId=${event.id}`, {
  //         method: 'DELETE',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({ eventId: event.id, userEmail: user.email }),
  //       });
  //       if (!res.ok) throw new Error('Неуспешно отписване');
  //       setIsRegistered(false);
  //       Alert.alert('Успех', 'Регистрацията е отменена');
  //     } else {
  //       const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/event-register?email=${user.email}&eventId=${event.id}`, {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({ eventId: event.id, userEmail: user.email }),
  //       });
  //       if (!res.ok) throw new Error('Неуспешна регистрация');
  //       setIsRegistered(true);
  //       Alert.alert('Успех', 'Успешна регистрация!');
  //     }
  //   } catch (error) {
  //     console.error('Registration error:', error);
  //     Alert.alert('Грешка', 'Неуспешна операция');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
      console.error('Sharing error:', error);
      Alert.alert('Грешка', 'Неуспешно споделяне');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: event.bannerUrl }} style={styles.banner} />
      <Text style={styles.title}>{event.name}</Text>
      <Text style={styles.organizer}>Организатор: {event.email}</Text>
      <Text style={styles.category}>{event.category}</Text>

      <View style={styles.detailRow}>
        <Ionicons name="calendar-outline" size={16} color={Colors.PRIMARY} />
        <Text style={styles.detailText}>
          {new Date(event.eventDate).toLocaleDateString('bg-BG')} в {event.eventTime}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Ionicons name="location-outline" size={16} color={Colors.PRIMARY} />
        <Text style={styles.detailText}>{event.location}</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={[styles.button, styles.shareButton]} onPress={shareEvent}>
          <Text style={styles.shareButtonText}>Сподели</Text>
        </TouchableOpacity>
{/* 
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
        </TouchableOpacity> */}
      </View>

      {!hideDetailsButton && (
        <TouchableOpacity style={styles.editButton} onPress={() => router.push(`../event/${event.id}`)}>
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
