import React, { useEffect, useState, useContext } from 'react';
import { Text, View, ActivityIndicator, Alert, ScrollView, Button, Image, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import Colors from '@/app/constants/Colors';
import EventCard from '@/components/Events/EventCard';
import { AuthContext } from '@/context/AuthContext';

export default function EventDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const [userRole, setUserRole] = useState<string>('');
    const [isEventCreator, setIsEventCreator] = useState(false);

    useEffect(() => {
        const fetchEventAndUser = async () => {
            try {
                // Fetch event data
                const eventResponse = await axios.get(`${process.env.EXPO_PUBLIC_HOST_URL}/events?id=${id}`);
                const apiData = eventResponse.data;

                const formattedEvent = {
                    id: apiData.id,
                    name: apiData.name,
                    bannerUrl: apiData.bannerurl,
                    location: apiData.location,
                    link: apiData.link,
                    eventDate: apiData.event_date,
                    eventTime: apiData.event_time,
                    email: apiData.email || apiData.username,
                    createdby: apiData.createdby,
                    createdon: apiData.createdon,
                    lat: apiData.lat,
                    lon: apiData.lon,
                    category: apiData.category,
                };

                setEvent(formattedEvent);

                // Fetch user role if user is logged in
                if (user?.email) {
                    const userResponse = await axios.get(`${process.env.EXPO_PUBLIC_HOST_URL}/user?email=${user.email}`);
                    if (userResponse.data) {
                        setUserRole(userResponse.data.role);
                        // Check if current user is the creator of this event
                        setIsEventCreator(userResponse.data.email === formattedEvent.createdby);
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                Alert.alert('Грешка', 'Неуспешно зареждане на данните.');
            } finally {
                setLoading(false);
            }
        };

        fetchEventAndUser();
    }, [id, user?.email]);

    const renderMap = () => {
        if (!event?.lat || !event?.lon) {
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

    // Проверка дали потребителят трябва да вижда бутоните
    const showAdminControls = userRole === 'admin' || (userRole === 'organizer' && isEventCreator);

    return (
        <ScrollView contentContainerStyle={{ padding: 10 }}>
            <EventCard event={event} hideDetailsButton={true} />
            {renderMap()}

            {showAdminControls && (
                <>
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
                            onPress={handleDeleteEvent}
                            color="red"
                        />
                    </View>
                </>
            )}
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