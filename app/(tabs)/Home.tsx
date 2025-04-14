import { View, Text, StyleSheet, ActivityIndicator, FlatList, ImageBackground, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { db } from 'configs/FirebaseConfig';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import Header from '@/components/Shared/Home/Header';
import Category from '@/components/Shared/Home/Category';
import EventCard from '@/components/Shared/Home/EventCard';
import { useRouter } from 'expo-router';

type Event = {
  id: string;
  title: string;
  imageUrl: string;
  date: any;
  location?: string;
};

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const featuredQuery = query(collection(db, 'events'), orderBy('date', 'asc'), limit(1));
        const featuredSnapshot = await getDocs(featuredQuery);
  
        if (!featuredSnapshot.empty) {
          const featuredDoc = featuredSnapshot.docs[0];
          const data = featuredDoc.data();
          setFeaturedEvent({
            id: featuredDoc.id,
            title: data.title,
            imageUrl: data.imageUrl,
            date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
            location: data.location,
          });
        }
  
        const eventsQuery = query(collection(db, 'events'), orderBy('date', 'asc'), limit(10));
        const eventsSnapshot = await getDocs(eventsQuery);
  
        const eventsList = eventsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            imageUrl: data.imageUrl,
            date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
            location: data.location,
          };
        });
  
        setEvents(eventsList);
      } catch (error) {
        console.error('Error fetching events: ', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchEvents();
  }, []);

  const formatDate = (date: any) => {
    if (!date) return '';
    const jsDate = date.toDate ? date.toDate() : date;
    return jsDate.toLocaleDateString('bg-BG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderItem = ({ item }: { item: Event }) => (
    <EventCard
      title={item.title}
      date={formatDate(item.date)}
      image={{ uri: item.imageUrl }}
      // onPress={() => router.push(`/event/${item.id}`)}
    />
  );

  const ListHeaderComponent = (
    <>
      <Header />
      {featuredEvent && (
        <TouchableOpacity 
          style={styles.featuredContainer}
          // onPress={() => router.push(`/event/${featuredEvent.id}`)}
        >
          <ImageBackground
            source={{ uri: featuredEvent.imageUrl }}
            style={styles.featuredImage}
            imageStyle={styles.featuredImageStyle}
          >
            <View style={styles.featuredOverlay}>
              <Text style={styles.featuredTitle}>{featuredEvent.title}</Text>
              <Text style={styles.featuredDate}>{formatDate(featuredEvent.date)}</Text>
              {featuredEvent.location && (
                <Text style={styles.featuredLocation}>{featuredEvent.location}</Text>
              )}
            </View>
          </ImageBackground>
        </TouchableOpacity>
      )}
      <Category />
      <Text style={styles.sectionTitle}>Предстоящи събития</Text>
    </>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3a0ca3" />
      </View>
    );
  }

  return (
    <FlatList
      data={events}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={
        <Text style={styles.noEventsText}>Няма предстоящи събития</Text>
      }
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  featuredContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  featuredImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  featuredImageStyle: {
    borderRadius: 12,
  },
  featuredOverlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featuredDate: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
  featuredLocation: {
    color: '#fff',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1a1a1a',
    paddingHorizontal: 16,
  },
  noEventsText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 16,
    fontSize: 16,
  },
});