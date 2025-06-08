import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { AuthContext } from '@/context/AuthContext';
import Colors from '@/app/constants/Colors';
import EventCard from './EventCard';

// Дефиниране на тип, който съответства на EventData от EventCard
type Event = {
  id: string; // Променено от number на string
  name: string;
  bannerUrl: string;
  location: string;
  link: string;
  eventDate: string;
  eventTime: string;
  email: string;
  createdon: string;
  lat?: number;
  lon?: number;
  category: string;
  username?: string;
};

const FavoritesScreen = () => {
  const { user } = useContext(AuthContext);
  const [favorites, setFavorites] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_HOST_URL}/event?action=getFavorites&userId=${user.email}`
        );
        
        if (!response.ok) throw new Error('Failed to fetch favorites');
        
        const data: Event[] = await response.json();
        // Конвертиране на id към string, ако е необходимо
        const formattedData = data.map(item => ({
          ...item,
          id: item.id.toString()
        }));
        setFavorites(formattedData);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError('Error loading favorite events');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user?.email]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.messageText}>You must be logged in to view your favorite events.</Text>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.messageText}>You have no favorite events.</Text>
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <EventCard event={item} />}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContainer: {
    flex: 1,
    backgroundColor: Colors.GRAY,
  },
  listContent: {
    paddingBottom: 20,
  },
  errorText: {
    color: Colors.ERROR,
    fontSize: 16,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 16,
    textAlign: 'center',
    color: Colors.GRAY,
  },
});

export default FavoritesScreen;