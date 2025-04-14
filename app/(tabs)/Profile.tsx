import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  ScrollView, 
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { db } from '../../configs/FirebaseConfig';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

interface Event {
  id: string;
  title: string;
  date: Timestamp;
  // Добавете други полета ако са необходими
}

export default function Profile() {


  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'events' | 'add'>('events');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, orderBy('date', 'asc'));
      const querySnapshot = await getDocs(q);

      const eventsData: Event[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'Без заглавие',
          date: data.date, // Тук date трябва да е Timestamp
          // Добавете други полета тук
        };
      });



      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
      Alert.alert('Грешка', 'Неуспешно зареждане на събития');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'Неизвестна дата';
    try {
      return timestamp.toDate().toLocaleDateString('bg-BG');
    } catch {
      return 'Невалидна дата';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Администраторски панел</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'events' && styles.activeTab]}
          onPress={() => setActiveTab('events')}
        >
          <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>
            Моите събития
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'add' && styles.activeTab]}
          onPress={() => setActiveTab('add')}
        >
          <Text style={[styles.tabText, activeTab === 'add' && styles.activeTabText]}>
            Добави събитие
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'events' ? (
        <ScrollView style={styles.content}>
          <Text style={styles.sectionTitle}>Моите събития</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#3a0ca3" style={styles.loader} />
          ) : events.length === 0 ? (
            <Text style={styles.noEventsText}>Няма събития</Text>
          ) : (
            <View style={styles.eventsContainer}>
              {events.map((event) => (
                <View key={event.id} style={styles.eventCard}>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventDate}>
                      {formatDate(event.date)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => router.push(`../edit-event/${event.id}`)}
                  >
                    <Ionicons name="create-outline" size={20} color="#3a0ca3" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Добавяне на ново събитие</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/add-event')}
          >
            <Ionicons name="add-circle" size={24} color="white" />
            <Text style={styles.addButtonText}>Създай ново събитие</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// Стиловете остават същите
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#3a0ca3',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3a0ca3',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#3a0ca3',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#1a1a1a',
  },
  loader: {
    marginTop: 20,
  },
  noEventsText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  eventsContainer: {
    marginTop: 10,
  },
  eventCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  editButton: {
    marginLeft: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3a0ca3',
    padding: 15,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    marginLeft: 10,
    fontWeight: '500',
  },
});
