import { AuthContext } from '@/context/AuthContext';
import { useEffect, useState, useCallback, useContext, useRef } from 'react';
import { FlatList, RefreshControl, View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import QRCode from 'react-native-qrcode-svg';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';

interface Ticket {
  id: number;
  eventId: string;
  eventName: string;
  eventDate: string;
  seatNumber: string | number;
  eventImage?: string;
  venue?: string;
  category?: string;
}

interface Event {
  eventId: string;
  eventName: string;
  eventDate: string;
  venue?: string;
  category?: string;
}

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useContext(AuthContext);
  const qrCodeContainerRef = useRef<View>(null);
  const [showPastEvents, setShowPastEvents] = useState(false);

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

  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_HOST_URL}/events`);
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Failed to fetch events', error);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTickets();
  }, [fetchTickets]);

  const filterPastEvents = useCallback((tickets: Ticket[]) => {
    const now = new Date();
    return tickets.filter(ticket => {
      try {
        const eventDate = new Date(ticket.eventDate);
        return eventDate >= now;
      } catch (e) {
        console.error('Error parsing date', e);
        return false;
      }
    });
  }, []);

  const filteredTickets = showPastEvents ? tickets : filterPastEvents(tickets);

  const toggleFilter = () => setShowPastEvents(!showPastEvents);

  const getQRCodeDataURL = async (): Promise<string> => {
    try {
      if (!qrCodeContainerRef.current) throw new Error('QR ref not set');
      const uri = await captureRef(qrCodeContainerRef, { format: 'png', quality: 1 });
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return `data:image/png;base64,${base64}`;
    } catch (error) {
      console.error('Error capturing QR code:', error);
      return '';
    }
  };

  const generatePdf = async (ticket: Ticket) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const qrCodeDataURL = await getQRCodeDataURL();
      if (!qrCodeDataURL) throw new Error('No QR image');

      const html = `
        <html>
        <head>
          <style>
            body { font-family: Arial; padding: 20px; }
            .ticket { border: 2px dashed #ccc; padding: 20px; background: #f9f9f9; border-radius: 10px; }
            .info { margin-bottom: 10px; }
            .qr { text-align: center; margin-top: 20px; }
            .qr-image { width: 300px; height: 250px; object-fit: contain; }
            .event-image { width: 100%; height: 250px; object-fit: cover; border-radius: 8px; margin-bottom: 15px; }
          </style>
        </head>
        <body>
          <h1>${ticket.eventName}</h1>
          <p>Your Ticket</p>
          ${ticket.eventImage ? `<img src="${ticket.eventImage}" class="event-image" />` : ''}
          <div class="ticket">
            <div class="info"><strong>Date:</strong> ${new Date(ticket.eventDate).toLocaleString()}</div>
            <div class="info"><strong>Seat:</strong> ${ticket.seatNumber}</div>
            ${ticket.venue ? `<div class="info"><strong>Venue:</strong> ${ticket.venue}</div>` : ''}
            <div class="qr">
             <img src="${qrCodeDataURL}" class="qr-image" />
              <p>Scan to view event</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Ticket PDF',
        UTI: 'com.adobe.pdf',
      });
    } catch (err) {
      console.error('PDF Error:', err);
      Alert.alert('Error', 'Failed to generate PDF ticket');
    }
  };

  const renderTicketItem = ({ item: ticket, index }: { item: Ticket; index: number }) => {
    const eventId = ticket.eventId ?? 'unknown';
    const qrValue = `${process.env.EXPO_PUBLIC_HOST_URL}/events?id=${eventId}`;

    return (
      <Animatable.View animation="fadeInUp" delay={index * 100} style={styles.ticketContainer}>
        {/* Декоративни елементи */}
        <View style={styles.cornerTopLeft} />
        <View style={styles.cornerTopRight} />
        <View style={styles.cornerBottomLeft} />
        <View style={styles.cornerBottomRight} />
        <View style={styles.perforation} />
        <View style={styles.ribbon}>
          <Text style={styles.ribbonText}>OFFICIAL TICKET</Text>
        </View>

        {/* Заглавие */}
        <View style={styles.ticketHeader}>
          <Text style={styles.eventName}>{ticket.eventName}</Text>
        </View>

        {/* Снимка на събитието */}
        {ticket.eventImage && (
          <Image source={{ uri: ticket.eventImage }} style={styles.eventImage} />
        )}

        {/* Информация за билета */}
        <View style={styles.ticketContent}>
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Date: </Text>
            {new Date(ticket.eventDate).toLocaleString()}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Seat: </Text>
            {ticket.seatNumber}
          </Text>
          {ticket.venue && (
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Venue: </Text>
              {ticket.venue}
            </Text>
          )}
          {ticket.category && (
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Category: </Text>
              {ticket.category}
            </Text>
          )}

          {/* QR код секция */}
          <View ref={qrCodeContainerRef} collapsable={false} style={styles.qrCodeContainer}>
            <QRCode value={qrValue} size={150} />
            <Text style={{ marginTop: 8, color: '#666' }}>Scan for event details</Text>
          </View>

          {/* Бутон за PDF */}
          <TouchableOpacity onPress={() => generatePdf(ticket)} style={styles.pdfButton}>
            <Text style={styles.pdfButtonText}>DOWNLOAD TICKET</Text>
          </TouchableOpacity>
        </View>
      </Animatable.View>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="ticket-outline" size={60} color="#8B4513" />
      <Text style={styles.emptyText}>
        {showPastEvents ? 'No tickets found' : 'No upcoming events'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Animatable.View animation="pulse" easing="ease-out" iterationCount="infinite">
          <Ionicons name="ticket" size={64} color="#8B4513" />
          <Text style={styles.loadingText}>Loading your tickets...</Text>
        </Animatable.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#8B4513', '#A0522D']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>YOUR TICKETS</Text>
        <Text style={styles.headerSubtitle}>
          {filteredTickets.length} {filteredTickets.length === 1 ? 'TICKET' : 'TICKETS'}
        </Text>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={toggleFilter}
        >
          <MaterialIcons 
            name={showPastEvents ? 'filter-alt' : 'filter-alt-off'} 
            size={18} 
            color="white" 
          />
          <Text style={styles.filterButtonText}>
            {showPastEvents ? 'Showing all' : 'Upcoming only'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      <FlatList
        data={filteredTickets}
        renderItem={renderTicketItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyComponent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
    marginBottom: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'serif',
    marginBottom: 5,
  },
  headerSubtitle: {
    color: 'white',
    fontSize: 18,
    opacity: 0.9,
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  filterButton: {
    position: 'absolute',
    top: 50,
    right: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 50
  },
  filterButtonText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 14,
    paddingTop: 20,
  },
  ticketContainer: {
    backgroundColor: '#fff9e6',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e8e0c9',
    position: 'relative',
  },
  ticketHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e0c9',
    backgroundColor: '#f8f2e0',
  },
  eventName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3a3a3a',
    fontFamily: 'serif',
  },
  eventImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e0c9',
  },
  ticketContent: {
    padding: 16,
  },
  infoText: {
    fontSize: 18,
    color: '#555',
    marginBottom: 8,
    fontFamily: 'sans-serif',
  },
  infoLabel: {
    fontWeight: '600',
    color: '#333',
  },
  qrCodeContainer: {
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f2e0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e8e0c9',
  },
  pdfButton: {
    marginTop: 20,
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  pdfButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#d4c9a8',
    borderBottomRightRadius: 15,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#d4c9a8',
    borderBottomLeftRadius: 15,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: '#d4c9a8',
    borderTopRightRadius: 15,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: '#d4c9a8',
    borderTopLeftRadius: 15,
  },
  perforation: {
    position: 'absolute',
    marginTop: 50,
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: '#d4c9a8',
    borderStyle: 'dashed',
  },
  ribbon: {
    position: 'absolute',
    top: 10,
    right: -40,
    backgroundColor: '#8B4513',
    paddingVertical: 6,
    paddingHorizontal: 40,
    transform: [{ rotate: '45deg' }],
    zIndex: 2,
  },
  ribbonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 18,
    color: '#8B4513',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#8B4513',
  },
});