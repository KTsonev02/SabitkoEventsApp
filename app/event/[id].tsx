import React, { useEffect, useState, useContext } from 'react';
import { Text, View, ActivityIndicator, Alert, ScrollView, Button, Image, StyleSheet, TouchableOpacity } from 'react-native';
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
                    price: apiData.price,  // добавена цена
                    total_seats: apiData.total_seats  // добавен общ брой места
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
                    <Text>No Map</Text>
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
        // Извършване на изтриването без деактивиране на бутоните
        Alert.alert(
            'Изтриване на събитието',
            'Сигурни ли сте, че искате да изтриете това събитие?',
            [
                {
                    text: 'Отказ',
                    style: 'cancel',
                },
                {
                    text: 'Изтрий',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await axios.delete(`${process.env.EXPO_PUBLIC_HOST_URL}/events`, {
                                data: { id }
                            });
                            Alert.alert('Успех', 'Събитието беше изтрито успешно', [
                                {
                                    text: 'OK',
                                    onPress: () => router.replace('/Event'),
                                },
                            ]);
                        } catch (error) {
                            console.error('Грешка при изтриване:', error);
                            Alert.alert('Грешка', 'Неуспешно изтриване на събитието');
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

            {/* Add the link display here */}
            {event.link && (
            <View style={styles.detailsContainer}>
                <Text style={styles.detailsTitle}>Details:</Text>
                <Text style={styles.detailsText}>{event.link}</Text>
            </View>
            )}

            {/* Show price and total seats */}
            {event.price && (
                <View style={styles.detailsContainer}>
                <View style={styles.rowContainer}>
                    <Text style={styles.detailsTitle}>Price:</Text>
                    <Text style={styles.detailsText}>{event.price} лв.</Text>
                </View>
                <View style={styles.rowContainer}>
                    <Text style={styles.detailsTitle}>Total Seats:</Text>
                    <Text style={styles.detailsText}>{event.total_seats}</Text>
                 </View>
                </View>
                )}


            <View style={{ marginTop: 2 }}>
                <TouchableOpacity
                    onPress={() => router.push(`../buy-tickets/${event.id}`)}
                    style={styles.largeButton}
                >
                    <Text style={styles.buttonText}>Buy Ticket!</Text>
                </TouchableOpacity>
            </View>

            {showAdminControls && (
                <>
                    <View style={{ marginTop: 20 }}>
                    <TouchableOpacity
                            onPress={() => router.push(`../edit-event/${event.id}`)}
                            style={styles.largeButton}
                        >
                            <Text style={styles.buttonText}>Edit Event</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ marginTop: 20, marginBottom: 70 }}>
                        <TouchableOpacity
                            onPress={handleDeleteEvent}
                            style={styles.largeButton}
                        >
                            <Text style={styles.buttonText}>Delete Event</Text>
                        </TouchableOpacity>
                    </View>
                    {/* Добавяне на бутон за купуване на билети */}
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
    detailsContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    
    rowContainer: {
        flexDirection: 'row', // Подреждаме елементите в ред
        justifyContent: 'space-between', // Разстояние между тях
        marginBottom: 10, // Леко разстояние между редовете
    },
    
    detailsTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.PRIMARY,
        marginBottom: 10,
    },
    
    detailsText: {
        fontSize: 16,
        color: '#555',
        lineHeight: 22,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    mapImage: {
        height: 150,
        width: '100%',
        borderRadius: 8,
        marginVertical: 10,
    },
    largeButton: {
        marginTop: 10,
        backgroundColor: Colors.PRIMARY,
        paddingVertical: 15,
        paddingHorizontal: 25,  
        fontSize: 18,           
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
    },
});
