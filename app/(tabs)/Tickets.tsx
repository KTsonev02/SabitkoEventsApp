import { AuthContext } from '@/context/AuthContext';
import { useEffect, useState, useCallback, useContext } from 'react';
import { FlatList, RefreshControl, View, Text, Image, TouchableOpacity } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

interface Ticket {
  id: number;
  eventName: string;
  eventDate: string;
  seatNumber: string | number;
  eventImage?: string;
  venue?: string;
  category?: string;
}

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();

  const fetchTickets = useCallback(async () => {
    try {
      const userId = user?.id;
      if (!userId) return;

      const res = await fetch(`${process.env.EXPO_PUBLIC_HOST_URL}/events?action=getTickets&userId=${userId}`);
      const data = await res.json();
      setTickets(data);
    } catch (error) {
      console.error('Failed to fetch tickets', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTickets();
  }, [fetchTickets]);

  const renderTicketItem = ({ item: ticket, index }: { item: Ticket; index: number }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      className="mx-4 my-3"
    >
      <View className="bg-white rounded-3xl overflow-hidden shadow-xl">
        {/* Event Image */}
        {ticket.eventImage ? (
          <Image 
            source={{ uri: ticket.eventImage }} 
            className="w-full h-48"
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={['#6366f1', '#a855f7']}
            className="w-full h-48 items-center justify-center"
          >
            <Ionicons name="ticket" size={64} color="white" />
          </LinearGradient>
        )}

        {/* Ticket Content */}
        <View className="p-6">
          {/* Event Name and Category */}
          <View className="flex-row justify-between items-start">
            <Text className="text-2xl font-bold text-gray-900 flex-1">
              {ticket.eventName}
            </Text>
            {ticket.category && (
              <View className="bg-purple-100 px-3 py-1 rounded-full ml-2">
                <Text className="text-purple-800 text-xs font-semibold">{ticket.category}</Text>
              </View>
            )}
          </View>

          {/* Event Info */}
          <View className="mt-4 space-y-3">
            {/* Date */}
            <View className="flex-row items-center">
              <MaterialIcons name="date-range" size={20} color="#6b7280" />
              <Text className="text-gray-600 ml-2 text-base">
                {new Date(ticket.eventDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>

            {/* Venue (only if available) */}
            {ticket.venue && (
              <View className="flex-row items-center">
                <MaterialIcons name="place" size={20} color="#6b7280" />
                <Text className="text-gray-600 ml-2 text-base">{ticket.venue}</Text>
              </View>
            )}

            {/* Seat */}
            <View className="flex-row items-center">
              <FontAwesome name="ticket" size={18} color="#6b7280" />
              <Text className="text-gray-600 ml-2 text-base">Seat: {ticket.seatNumber}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="mt-6 flex-row justify-between">
            <TouchableOpacity className="bg-gray-100 px-4 py-2 rounded-full flex-row items-center">
              <MaterialIcons name="share" size={18} color="#4f46e5" />
              <Text className="text-purple-600 ml-2 font-medium">Share</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="bg-purple-600 px-4 py-2 rounded-full flex-row items-center"
              // onPress={() => navigation.navigate('/Event', { eventId: ticket.id })}
            >
              <MaterialIcons name="info" size={18} color="white" />
              <Text className="text-white ml-2 font-medium">Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animatable.View>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Animatable.View 
          animation="pulse"
          easing="ease-out"
          iterationCount="infinite"
          className="items-center"
        >
          <Ionicons name="ticket" size={64} color="#4f46e5" />
          <Text className="mt-6 text-xl text-gray-600 font-medium">Loading your tickets...</Text>
        </Animatable.View>
      </View>
    );
  }

  if (tickets.length === 0) {
    return (
      <View className="flex-1 bg-gray-50">
        <LinearGradient
          colors={['#4f46e5', '#7c3aed']}
          className="p-6 pb-12 rounded-b-3xl"
        >
          <Text className="text-white text-3xl font-bold">My Tickets</Text>
        </LinearGradient>
        
        <View className="flex-1 items-center justify-center px-8 -mt-12">
          <Animatable.View 
            animation="fadeIn"
            className="items-center bg-white p-8 rounded-3xl shadow-lg w-full"
          >
            <View className="bg-purple-100 p-6 rounded-full">
              <Ionicons name="ticket" size={48} color="#4f46e5" />
            </View>
            <Text className="text-2xl font-bold text-gray-800 mt-6">No Tickets Yet</Text>
            <Text className="text-gray-500 text-center mt-3">
              You haven't purchased any tickets yet. Explore amazing events and book your first experience!
            </Text>
            <TouchableOpacity 
              className="mt-6 bg-purple-600 px-6 py-3 rounded-full"
              // onPress={() => navigation.navigate('/Events')}
            >
              <Text className="text-white font-medium">Browse Events</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={['#4f46e5', '#7c3aed']}
        className="p-6 pb-12 rounded-b-3xl"
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-3xl font-bold">My Tickets</Text>
            <Text className="text-white opacity-90 mt-1 text-lg">
              {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
            </Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="filter" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tickets List */}
      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#4f46e5']}
            tintColor="#4f46e5"
          />
        }
        renderItem={renderTicketItem}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
