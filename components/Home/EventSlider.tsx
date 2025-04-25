import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { useRouter } from 'expo-router'; // Импортирайте навигацията

interface Event {
    id: number;
    bannerurl: string;
    name: string;
    event_date: string;
    event_time?: string;
    location?: string;
}

const { width } = Dimensions.get('window');

const LastEvents = () => {
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter(); // Инициализирайте навигацията

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                setError(null);

                const API_URL = process.env.EXPO_PUBLIC_HOST_URL 
                console.log("Fetching from:", `${API_URL}/events`);

                const response = await fetch(`${API_URL}/events`);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();
                console.log("API Response:", data);

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Адаптирана филтрация за вашата API структура
                let upcomingEvents = data
                    .filter((event: Event) => {
                        try {
                            if (!event.id || !event.bannerurl || !event.name || !event.event_date) {
                                console.warn("Missing required fields in event:", event);
                                return false;
                            }
                            
                            // Комбинираме дата и час, ако има час
                            const eventDateStr = event.event_time 
                                ? `${event.event_date}T${event.event_time}`
                                : event.event_date;
                                
                            const eventDate = new Date(eventDateStr);
                            return eventDate >= today;
                        } catch (e) {
                            console.warn("Invalid date format:", event.event_date, e);
                            return false;
                        }
                    })
                    .sort((a: Event, b: Event) => {
                        const dateA = new Date(a.event_date).getTime();
                        const dateB = new Date(b.event_date).getTime();
                        return dateA - dateB;
                    })
                    .slice(0, 6)
                    .map((event: Event) => ({
                        id: event.id,
                        bannerurl: event.bannerurl,
                        name: event.name,
                        event_date: event.event_date,
                        event_time: event.event_time,
                        location: event.location
                    }));

                console.log("Filtered events:", upcomingEvents);

                if (upcomingEvents.length === 0) {
                    console.log("No upcoming events, using fallback");
                }

                setFilteredEvents(upcomingEvents);
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const formatDate = (dateString: string) => {
        try {
            const eventDate = new Date(dateString);
            const today = new Date();
            const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays === 0) return 'Днес';
            if (diffDays === 1) return 'Утре';
            if (diffDays < 7) return `След ${diffDays} дни`;
            
            return eventDate.toLocaleDateString('bg-BG', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });
        } catch (e) {
            console.warn("Date formatting error:", e);
            return dateString;
        }
    };

    const renderItem = ({ item }: { item: Event }) => {
        return (
            <TouchableOpacity 
                style={styles.card} 
                onPress={() => router.push(`../event/${item.id}`)} // Пренасочване към детайлната страница
            >
                <Image 
                    source={{ uri: item.bannerurl }} 
                    style={styles.image}
                    defaultSource={{ uri: 'https://via.placeholder.com/300x200' }}
                    onError={(e) => console.log("Image error:", e.nativeEvent.error)}
                />
                <Text style={styles.title} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.date}>{formatDate(item.event_date)}</Text>
                {item.location && <Text style={styles.location}>{item.location}</Text>}
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.header}>Предстоящи събития</Text>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Предстоящи събития</Text>
            
            {error && (
                <Text style={styles.errorText}>
                    {error.length > 50 ? `${error.substring(0, 50)}...` : error}
                </Text>
            )}

            <Carousel
                data={filteredEvents}
                renderItem={renderItem}
                width={width * 0.85}
                height={280}
                loop={false}
                autoPlay={false}
                style={styles.carousel}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f8f9fa',
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#2c3e50',
        textAlign: 'center',
    },
    carousel: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 15,
        alignItems: 'center',
        width: '95%',
        height: 280,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5,
        marginHorizontal: 5,
    },
    image: {
        width: '100%',
        height: 180, // по-голяма височина
        borderRadius: 16, // по-изразено заобляне
        resizeMode: 'cover',
        backgroundColor: '#ecf0f1',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        marginTop: 8,
        color: '#2d3436',
        textAlign: 'center',
        maxWidth: '100%',
    },
    date: {
        fontSize: 14,
        color: 'red',
        marginTop: 4,
    },
    location: {
        fontSize: 13,
        color: '#b2bec3',
        marginTop: 2,
        fontStyle: 'italic',
    },
    errorText: {
        color: '#e74c3c',
        textAlign: 'center',
        marginBottom: 15,
    },
});

export default LastEvents;
