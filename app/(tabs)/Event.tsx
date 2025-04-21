import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import Button from '@/components/Shared/Button';
import axios from 'axios';
import EventCard from '@/components/Events/EventCard';
import Colors from '../constants/Colors';
import { AuthContext } from '@/context/AuthContext';

export type EventType = {
  id: number;
  name: string;
  bannerurl: string;
  location: string;
  link: string;
  event_date: string;
  event_time: string;
  createdby: string;
  username: string;
  lat?: number;
  lon?: number;
  category: string; // Added category property
};

export default function Event() {
  const router = useRouter();
  const [eventList, setEventList] = useState<EventType[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  
  useEffect(() => {
    if (selectedTab === 0) {
      GetAllEvents();
    } else {
      GetUserEvents();
    }
  }, [selectedTab]);
  
  const GetAllEvents = async () => {
    setLoading(true);
    try {
      const result = await axios.get(process.env.EXPO_PUBLIC_HOST_URL + '/events');
      // Ensure each event has a category, provide default if missing
      const eventsWithCategory = result.data.map((event: any) => ({
        ...event,
        category: event.category || 'General' // Default category
      }));
      setEventList(eventsWithCategory);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const GetUserEvents = async () => {
    setLoading(true);
    try {
      const result = await axios.get(process.env.EXPO_PUBLIC_HOST_URL + '/event-register?email=' + user?.email);
      // Ensure each event has a category, provide default if missing
      const eventsWithCategory = result.data.map((event: any) => ({
        ...event,
        category: event.category || 'General' // Default category
      }));
      setEventList(eventsWithCategory);
    } catch (error) {
      console.error('Error fetching user events:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Events</Text>
        <Button text='  +  ' onPress={() => router.push('/add-event')} />
      </View>
 
      <View style={styles.tabContainer}>
        <Pressable onPress={() => setSelectedTab(0)}>
          <Text style={[styles.tabtext, { 
            backgroundColor: selectedTab === 0 ? Colors.PRIMARY : Colors.WHITE, 
            color: selectedTab === 0 ? Colors.WHITE : Colors.PRIMARY 
          }]}>Upcoming</Text>
        </Pressable>
        <Pressable onPress={() => setSelectedTab(1)}>
          <Text style={[styles.tabtext, { 
            backgroundColor: selectedTab === 1 ? Colors.PRIMARY : Colors.WHITE, 
            color: selectedTab === 1 ? Colors.WHITE : Colors.PRIMARY 
          }]}>Registered</Text>
        </Pressable>
      </View>
 
      {loading ? (
        <ActivityIndicator size="large" color={Colors.PRIMARY} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={eventList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }: { item: EventType }) => {
            const enrichedEvent = {
              ...item,
              isRegistered: selectedTab === 1
            };
            return <EventCard event={enrichedEvent} />;
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  tabContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 20,
    padding: 15,
    paddingHorizontal: 30,
  },
  tabtext: {
    padding: 4,
    fontSize: 20,
    paddingHorizontal: 15,
    borderRadius: 99,
  }
});