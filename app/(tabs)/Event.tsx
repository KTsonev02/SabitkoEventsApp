// Типове за събития
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
  category: string; // Добавена категория
};

export type EventData = {
  id: string;
  name: string;
  bannerUrl: string;
  location: string;
  link: string;
  eventDate: string;
  eventTime: string;
  email: string;
  createdon: Date;
  lat?: number;
  lon?: number;
  category: string;
  isRegistered: boolean;
};

import DropDownPicker from 'react-native-dropdown-picker';

// Основен компонент за събития
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator, TextInput, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import Button from '@/components/Shared/Button';
import axios from 'axios';
import EventCard from '@/components/Events/EventCard';
import Colors from '../constants/Colors';
import { AuthContext } from '@/context/AuthContext';

export default function Event() {
  const router = useRouter();
  const [eventList, setEventList] = useState<EventType[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventType[]>([]); // Състояние за филтрираните събития
  const [searchQuery, setSearchQuery] = useState(''); // Състояние за търсене по име
  const [categoryQuery, setCategoryQuery] = useState(''); // Състояние за търсене по категория
  const [dateQuery, setDateQuery] = useState(''); // Състояние за търсене по дата
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState<string[]>(['Music', 'Education', 'Business', 'Technology', 'Sport']);
  const [open, setOpen] = useState(false); // Състояние за отваряне на падащото меню
  const [searchVisible, setSearchVisible] = useState(true); // Състояние за видимост на търсачката
  
  useEffect(() => {
    if (selectedTab === 0) {
      GetAllEvents();
    } else {
      GetUserEvents();
    }
  }, [selectedTab]);

  useEffect(() => {
    const uniqueCategories = [...new Set(eventList.map(event => event.category))];
    setCategories(uniqueCategories);

    if (searchQuery === '' && categoryQuery === '' && dateQuery === '') {
      setFilteredEvents(eventList);
    } else {
      const filtered = eventList.filter((event) =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        event.category.toLowerCase().includes(categoryQuery.toLowerCase()) &&
        event.event_date.includes(dateQuery)
      );
      setFilteredEvents(filtered);
    }
  }, [searchQuery, categoryQuery, dateQuery, eventList]);

  const GetAllEvents = async () => {
    setLoading(true);
    try {
      const result = await axios.get(process.env.EXPO_PUBLIC_HOST_URL + '/events');
      const eventsWithCategory = result.data.map((event: any) => ({
        ...event,
        category: event.category || 'General',
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
      const eventsWithCategory = result.data.map((event: any) => ({
        ...event,
        category: event.category || 'General',
      }));
      setEventList(eventsWithCategory);
    } catch (error) {
      console.error('Error fetching user events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <Text style={styles.title}>Events</Text>
            <Button text='  +  ' onPress={() => router.push('/add-event')} />
          </View>

          {/* Бутон за показване/скриване на търсачката */}
          <Pressable onPress={() => setSearchVisible(!searchVisible)}>
            <Text style={styles.toggleSearchButton}>{searchVisible ? 'Скрий търсачката' : 'Покажи търсачката'}</Text>
          </Pressable>

          {/* Търсачка */}
          {searchVisible && (
            <>
              <TextInput
                placeholder="Търсене на събитие"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
              />

              {/* Търсачка по категория */}
              <DropDownPicker 
                style={{width: "90%"}}
                placeholder="Търсене по категория"
                open={open} // Управляваме отварянето на падащото меню
                value={categoryQuery}
                items={categories.map(category => ({ label: category, value: category }))}
                setOpen={setOpen} // Отваряне/затваряне на падащото меню
                setValue={setCategoryQuery} // Актуализиране на избраната категория
                containerStyle={styles.dropdown}
                listItemContainerStyle={styles.dropdownList}
              />

              {/* Търсачка по дата */}
              <TextInput
                placeholder="Търсене по дата (формат: YYYY-MM-DD)"
                value={dateQuery}
                onChangeText={setDateQuery}
                style={styles.searchInput}
              />
            </>
          )}

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
              data={filteredEvents} 
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                const enrichedEvent = {
                  id: item.id.toString(),
                  name: item.name,
                  bannerUrl: item.bannerurl,
                  location: item.location,
                  link: item.link,
                  eventDate: item.event_date,
                  eventTime: item.event_time,
                  email: item.createdby,
                  createdon: new Date(),
                  lat: item.lat,
                  lon: item.lon,
                  category: item.category,
                  isRegistered: selectedTab === 1,
                };
                return (
                    <EventCard event={enrichedEvent} />
                );
              }}
              contentContainerStyle={{ paddingBottom: 100 }} 
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  },
  searchInput: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    margin: 20,
  },
  dropdown: {
    marginBottom: 20,
    marginHorizontal: 20,
  },
  dropdownPicker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
  },
  dropdownList: {
    backgroundColor: '#fff',
    maxHeight: 200,
  },
  toggleSearchButton: {
    paddingLeft: 25,
    marginBottom: 5,
    color: Colors.PRIMARY,
    fontSize: 16,
    fontWeight: 'bold',
  }
});
