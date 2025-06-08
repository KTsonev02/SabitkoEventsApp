import React, { useContext, useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AuthContext } from '@/context/AuthContext';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { router } from 'expo-router';
import Colors from '@/app/constants/Colors';

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
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkFavoriteStatus();
  }, [user]);

  const checkFavoriteStatus = async () => {
    if (!user?.email) return;

    try {
      const url = `${process.env.EXPO_PUBLIC_HOST_URL}/events?action=checkFavorite&userId=${user.email}&eventId=${event.id}`;
      const response = await fetch(url);

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Expected JSON but got: ${text.substring(0, 100)}...`);
      }

      const data = await response.json();
      if (typeof data.isFavorite !== 'boolean') throw new Error('Invalid response format');

      setIsFavorite(data.isFavorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
      Alert.alert('Error', 'Failed to check favorite status');
    }
  };

  const toggleFavorite = async () => {
    if (!user?.email) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    setLoading(true);
    try {
      const url = `${process.env.EXPO_PUBLIC_HOST_URL}/events?action=toggleFavorite`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          userId: user.email,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      if (typeof data.isFavorite !== 'boolean') throw new Error('Invalid response format');

      setIsFavorite(data.isFavorite);
      Alert.alert('Success', data.isFavorite ? 'Event added to favorites' : 'Event removed from favorites');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Operation failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

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
        Alert.alert('Error', 'Sharing feature not available');
      }
    } catch (error) {
      console.error('Sharing error:', error);
      Alert.alert('Error', 'Sharing failed');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: event.bannerUrl }} style={styles.banner} />
      <Text style={styles.title}>{event.name}</Text>
      <Text style={styles.organizer}>Organizer: {event.email}</Text>
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
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            isFavorite ? styles.favoriteButtonActive : styles.favoriteButtonInactive
          ]}
          onPress={toggleFavorite}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={16}
                color="#fff"
                style={styles.favoriteIcon}
              />
              <Text style={styles.favoriteButtonText}>
                {isFavorite ? 'Favorite' : 'Add'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {!hideDetailsButton && (
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push(`../event/${event.id}`)}
        >
          <Text style={styles.editButtonText}>See details</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

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
    height: 200,
    borderRadius: 8,
    borderWidth: 5,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  organizer: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 5,
  },
  category: {
    fontSize: 14,
    color: Colors.PRIMARY,
    fontWeight: '500',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#555',
  },
  buttonsContainer: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
    backgroundColor: Colors.GRAY,
  },
  shareButtonText: {
    color: '#333',
    fontSize: 14,
  },
  favoriteButtonInactive: {
    backgroundColor: Colors.GRAY,
  },
  favoriteButtonActive: {
    backgroundColor: Colors.RED,
  },
  favoriteButtonText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 5,
  },
  favoriteIcon: {
    marginRight: 5,
  },
  editButton: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 8,
    padding: 12,
    marginTop: 5,
  },
  editButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default EventCard;
