import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator, TextInput, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import Button from '@/components/Shared/Button';
import axios from 'axios';
import EventCard from '@/components/Events/EventCard';
import Colors from '../constants/Colors';
import { AuthContext } from '@/context/AuthContext';
import DropDownPicker from 'react-native-dropdown-picker';


export default function Event() {
  const router = useRouter();
  const [eventList, setEventList] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryQuery, setCategoryQuery] = useState('');
  const [dateQuery, setDateQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [searchVisible, setSearchVisible] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      if (user?.email) {
        try {
          const response = await axios.get(`${process.env.EXPO_PUBLIC_HOST_URL}/user?email=${user.email}`);
          if (response.data && response.data.role) {
            setUserRole(response.data.role);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }
    };
    checkUserRole();
  }, [user?.email]);

  useEffect(() => {
    if (selectedTab === 0) {
      GetAllEvents();
    } else {
      GetUserEvents();
    }
  }, [selectedTab]);

  useEffect(() => {
    const uniqueCategories = [...new Set(eventList.map(event => event.category || 'General'))];
    setCategories(uniqueCategories);

    const filtered = eventList.filter((event) =>
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      event.category.toLowerCase().includes(categoryQuery.toLowerCase()) &&
      event.event_date.includes(dateQuery)
    );
    setFilteredEvents(filtered);
  }, [searchQuery, categoryQuery, dateQuery, eventList]);

  const GetAllEvents = async () => {
    setLoading(true);
    try {
      const result = await axios.get(`${process.env.EXPO_PUBLIC_HOST_URL}/events`);
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
      const result = await axios.get(`${process.env.EXPO_PUBLIC_HOST_URL}/event-register?email=${user?.email}`);
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

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryQuery('');
    setDateQuery('');
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: Date) => {
    const formatted = date.toISOString().split('T')[0];
    setDateQuery(formatted);
    hideDatePicker();
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
            {(userRole === 'organizer' || userRole === 'admin') && (
              <Button text='  +  ' onPress={() => router.push('/add-event')} />
            )}
          </View>

          <Pressable onPress={() => setSearchVisible(!searchVisible)}>
            <Text style={styles.toggleSearchButton}>
              {searchVisible ? 'Скрий търсачката' : 'Покажи търсачката'}
            </Text>
          </Pressable>

          {searchVisible && (
            <>
              <TextInput
                placeholder="Търсене на събитие по име"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
              />

              <DropDownPicker 
                style={{width: "90%"}}
                placeholder="Търсене по категория"
                open={open}
                value={categoryQuery}
                items={categories.map(category => ({ label: category, value: category }))}
                setOpen={setOpen}
                setValue={setCategoryQuery}
                containerStyle={styles.dropdown}
                listItemContainerStyle={styles.dropdownList}
              />

              <View style={styles.dateRow}>
                <Pressable onPress={showDatePicker} style={styles.dateButton}>
                  <Text style={styles.dateButtonText}>
                    {dateQuery ? `Дата: ${dateQuery}` : 'Избери дата'}
                  </Text>
                </Pressable>
                {dateQuery !== '' && (
                  <Pressable onPress={() => setDateQuery('')}>
                    <Text style={styles.clearDateText}>✕</Text>
                  </Pressable>
                )}
              </View>

              {/* <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
            /> */}
              <Pressable onPress={clearFilters} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>Изчисти филтрите</Text>
              </Pressable>
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
                  ...item,
                  id: item.id.toString(),
                  bannerUrl: item.bannerurl,
                  eventDate: item.event_date,
                  eventTime: item.event_time,
                  email: item.createdby,
                  isRegistered: selectedTab === 1,
                  createdon: new Date(),
                };
                return <EventCard event={enrichedEvent} />;
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 30, fontWeight: 'bold' },
  tabContainer: {
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
  },
  clearButton: {
    alignSelf: 'center',
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  clearButtonText: {
    color: Colors.PRIMARY,
    fontWeight: 'bold',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
    marginBottom: 15,
  },
  dateButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  dateButtonText: {
    color: Colors.PRIMARY,
    fontWeight: 'bold',
  },
  clearDateText: {
    marginLeft: 10,
    fontSize: 20,
    color: '#888',
  },
});
