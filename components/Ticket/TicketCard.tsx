import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';

interface Ticket {
  id: string | number;
  title: string;
  date: string;
  location?: string;
  seat: string | number;
  price?: string;
  ticketId: string | number;
  bannerUrl?: string; // Снимка на събитието
}

const TicketCard: React.FC<Ticket> = ({
  bannerUrl,
  title,
  date,
  location,
  seat,
  price,
  ticketId
}) => {
  return (
    <View style={styles.card}>
      {/* Изображение на събитието */}
      {bannerUrl && <Image source={{ uri: bannerUrl }} style={styles.image} />}
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>📅 {date}</Text>
      {location && <Text style={styles.text}>📍 {location}</Text>}
      <Text style={styles.text}>💺 Седалка: {seat}</Text>
      {price && <Text style={styles.text}>💰 {price} лв</Text>}

      <View style={styles.qrContainer}>
        <QRCode value={ticketId.toString()} size={100} />
      </View>
    </View>
  );
};

const TicketsScreen: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Зареждаме билетите (тук ще може да бъде извършена заявка към бекенд)
    const mockTickets: Ticket[] = [

    ];
    setTickets(mockTickets);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Тук можем да извършим ново зареждане на данни
    // Примерно:
    // await fetchTickets();
    setRefreshing(false);
  };

  const renderTicketItem = ({ item }: { item: Ticket }) => (
    <TicketCard
      id={item.id}
      title={item.title}
      date={item.date}
      location={item.location}
      seat={item.seat}
      price={item.price}
      ticketId={item.ticketId}
      bannerUrl={item.bannerUrl}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <LinearGradient
        colors={['#4f46e5', '#7c3aed']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Tickets</Text>
          <Text style={styles.headerSubtitle}>{tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}</Text>
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
};

const styles = StyleSheet.create({
  header: {
    padding: 24,
    paddingBottom: 48,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  card: {
    backgroundColor: 'white',
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 10,
  },
  text: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingBottom: 5,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
});

export default TicketsScreen;
