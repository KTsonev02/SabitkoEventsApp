import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator, TextInput, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import Button from '@/components/Shared/Button';
import axios from 'axios';
import EventCard from '@/components/Events/EventCard';
import Colors from '../constants/Colors';
import { AuthContext } from '@/context/AuthContext';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function Event() {
  const router = useRouter();
  const [eventList, setEventList] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryQuery, setCategoryQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [userRole, setUserRole] = useState('');

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);

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

    const filtered = eventList.filter((event) => {
      const matchesName = event.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = event.category.toLowerCase().includes(categoryQuery.toLowerCase());
      const eventDate = new Date(event.event_date);
      const matchesDate = (!startDate || eventDate >= startDate) && (!endDate || eventDate <= endDate);
      return matchesName && matchesCategory && matchesDate;
    });

    setFilteredEvents(filtered);
  }, [searchQuery, categoryQuery, startDate, endDate, eventList]);

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
    setStartDate(null);
    setEndDate(null);
  };

  const showStartDatePicker = () => setStartDatePickerVisibility(true);
  const showEndDatePicker = () => setEndDatePickerVisibility(true);
  const hideStartDatePicker = () => setStartDatePickerVisibility(false);
  const hideEndDatePicker = () => setEndDatePickerVisibility(false);

  const handleConfirmStartDate = (date: Date) => {
    setStartDate(date);
    hideStartDatePicker();
  };

  const handleConfirmEndDate = (date: Date) => {
    setEndDate(date);
    hideEndDatePicker();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <Text style={styles.title}>Events</Text>
            {(userRole === 'organizer' || userRole === 'admin') && (
              <Button text="  +  " onPress={() => router.push('/add-event')} />
            )}
          </View>

          <Pressable onPress={() => setSearchVisible(!searchVisible)}>
            <Text style={styles.toggleSearchButton}>
              {searchVisible ? 'Hide Search bar' : 'Show Search bar'}
            </Text>
          </Pressable>

          {searchVisible && (
            <View style={styles.filtersContainer}>
              <TextInput
                placeholder="Search by name"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.inputSmall}
              />
              <DropDownPicker
                placeholder="Category"
                open={open}
                value={categoryQuery}
                items={categories.map((c) => ({ label: c, value: c }))}
                setOpen={setOpen}
                setValue={setCategoryQuery}
                style={styles.dropdownSmall}
                containerStyle={{ width: '48%' }}
              />
              <View style={styles.dateRow}>
                <Pressable onPress={showStartDatePicker} style={styles.dateButton}>
                  <Text style={styles.dateButtonText}>
                    {startDate ? `From: ${startDate.toISOString().split('T')[0]}` : 'From Date'}
                  </Text>
                </Pressable>
                <Pressable onPress={showEndDatePicker} style={styles.dateButton}>
                  <Text style={styles.dateButtonText}>
                    {endDate ? `To: ${endDate.toISOString().split('T')[0]}` : 'To Date'}
                  </Text>
                </Pressable>
              </View>
              <Pressable onPress={clearFilters} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>Clear</Text>
              </Pressable>
              <DateTimePickerModal
                isVisible={isStartDatePickerVisible}
                mode="date"
                onConfirm={handleConfirmStartDate}
                onCancel={hideStartDatePicker}
              />
              <DateTimePickerModal
                isVisible={isEndDatePickerVisible}
                mode="date"
                onConfirm={handleConfirmEndDate}
                onCancel={hideEndDatePicker}
              />
            </View>
          )}

          <View style={styles.tabContainer}>
            <Pressable onPress={() => setSelectedTab(0)}>
              <Text style={[styles.tabText, selectedTab === 0 && styles.activeTab]}>Upcoming</Text>
            </Pressable>
            <Pressable onPress={() => setSelectedTab(1)}>
              <Text style={[styles.tabText, selectedTab === 1 && styles.activeTab]}>Registered</Text>
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
  toggleSearchButton: {
    paddingLeft: 25,
    marginBottom: 5,
    color: Colors.PRIMARY,
    fontSize: 16,
  },
  filtersContainer: {
    marginHorizontal: 20,
    marginBottom: 10,
    gap: 10,
  },
  inputSmall: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
  },
  dropdownSmall: {
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  dateButton: {
    flex: 1,
    padding: 10,
    backgroundColor: Colors.GRAY,
    borderRadius: 8,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 14,
    color: Colors.BLACK,
  },
  clearButton: {
    backgroundColor: Colors.RED,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 20,
    padding: 15,
    paddingHorizontal: 30,
  },
  tabText: {
    padding: 6,
    fontSize: 18,
    paddingHorizontal: 15,
    borderRadius: 99,
    color: Colors.PRIMARY,
    backgroundColor: Colors.WHITE,
  },
  activeTab: {
    backgroundColor: Colors.PRIMARY,
    color: Colors.WHITE,
  },
});
