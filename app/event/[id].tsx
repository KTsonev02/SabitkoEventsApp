import React, { useEffect, useState } from 'react';
import { Text, View, ActivityIndicator, Alert, ScrollView, Button, Image, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import Colors from '@/app/constants/Colors';
import EventCard from '@/components/Events/EventCard';

export default function EventDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await axios.get(`${process.env.EXPO_PUBLIC_HOST_URL}/events?id=${id}`);
                const apiData = response.data;

                const formattedEvent = {
                    id: apiData.id,
                    name: apiData.name,
                    bannerUrl: apiData.bannerurl,
                    location: apiData.location,
                    link: apiData.link,
                    eventDate: apiData.event_date,
                    eventTime: apiData.event_time,
                    email: apiData.email || apiData.username,
                    createdon: apiData.createdon,
                    lat: apiData.lat,
                    lon: apiData.lon,
                    category: apiData.category,
                };
                console.log('Banner URL:', apiData.bannerUrl);
                console.log('API response:', response.data);

                setEvent(formattedEvent);
            } catch (error) {
                console.error('Error fetching event:', error);
                Alert.alert('Грешка', 'Неуспешно зареждане на събитието.');
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [id]);

    // 4. Генериране на карта (ако има координати)
      const renderMap = () => {
        if (!event.lat || !event.lon) {
          return (
            <View style={styles.mapPlaceholder}>
              <Text>Няма налична карта</Text>
            </View>
          );
        }
    
        const mapUrl = `https://maps.locationiq.com/v3/staticmap?key=pk.ec03b49d319c22cc4569574c50e8a04d&center=${event.lat},${event.lon}&zoom=15&size=600x300&markers=icon:small-red-cutout|${event.lat},${event.lon}`;
        
        return (
          <Image
            source={{ uri: mapUrl }}
            style={styles.mapImage}
            onError={() => console.log('Грешка при зареждане на карта')}
          />
        );
      };
    

    const handleDeleteEvent = async () => {
        Alert.alert(
          'Delete Event',
          'Are you sure you want to delete this event?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                try {
                  await axios.delete(`${process.env.EXPO_PUBLIC_HOST_URL}/events`, {
                    data: { id }
                  });
                  Alert.alert('Success', 'Event deleted successfully', [
                    {
                      text: 'OK',
                      onPress: () => router.replace('/Event'),
                    },
                  ]);
                } catch (error) {
                  console.error('Delete error:', error);
                  Alert.alert('Error', 'Failed to delete event');
                }
              },
            },
          ]
        );
      };
    

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Colors.PRIMARY} />
            </View>
        );
    }

    if (!event) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Събитието не е намерено.</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={{ padding: 10 }}>
            {/* Проверка дали има bannerUrl и показване на снимката директно тук */}


            <EventCard event={event} />
             {/* Карта */}
            {renderMap()}

            <View style={{ marginTop: 20 }}>
                <Button
                    title="Редактирай събитието"
                    onPress={() => router.push(`/edit-event/${event.id}`)}
                    color={Colors.PRIMARY}
                />
            </View>
            <View style={{ marginTop: 20 }}>
                <Button
                    title="Изтрий събитието"
                    onPress={() => handleDeleteEvent()} 
                    color="red" // Може да се промени на друг цвят, ако е необходимо
                />
            </View>
        </ScrollView>
    );
}


const styles = StyleSheet.create({
mapPlaceholder: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginVertical: 10,
  },
  mapImage: {
    height: 150,
    width: '100%',
    borderRadius: 8,
    marginVertical: 10,
  },
});