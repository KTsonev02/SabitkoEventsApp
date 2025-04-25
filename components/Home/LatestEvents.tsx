import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router'; // Импортирай навигацията

interface Event {
    id: number;
    bannerurl: string;
    name: string;
    event_date: string;
    event_time?: string;
    location?: string;
}

const windowWidth = Dimensions.get('window').width;
const itemWidth = windowWidth / 3 - 23;

const LatestEvents = () => {
    const [latestEvents, setLatestEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter(); // Инициализирай навигацията

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                setError(null);

                const API_URL = process.env.EXPO_PUBLIC_HOST_URL;
                const response = await fetch(`${API_URL}/events`);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();

                const latest = data
                    .filter((event: Event) => event.id && event.name && event.bannerurl)
                    .sort((a: Event, b: Event) => b.id - a.id)
                    .slice(0, 9);

                setLatestEvents(latest);
            } catch (error) {
                console.error("Fetch error:", error);
                setError("Грешка при зареждане на събития.");
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const renderItem = ({ item }: { item: Event }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/event/${item.id}`)} // Пренасочване към детайлната страница
        >
            <Image
                source={{ uri: item.bannerurl }}
                style={styles.image}
                resizeMode="cover"
            />
            <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.date}>{item.event_date}</Text>
            {item.location && <Text style={styles.location} numberOfLines={1}>{item.location}</Text>}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Последно добавени събития</Text>

            {loading && <ActivityIndicator size="large" color="#2980b9" />}
            {error && <Text style={styles.errorText}>{error}</Text>}

            {!loading && latestEvents.length === 0 && (
                <Text style={styles.noEventsText}>Няма събития.</Text>
            )}

            <FlatList
                data={latestEvents}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                numColumns={3}
                contentContainerStyle={styles.grid}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f5f6fa',
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
        textAlign: 'center',
        marginBottom: 15,
        marginTop: 10,
    },
    grid: {
        paddingHorizontal: 12,
        paddingBottom: 20,
    },
    card: {
        width: itemWidth,
        marginHorizontal: 6,
        marginVertical: 10,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    image: {
        width: '100%',
        height: 80,
        borderRadius: 8,
        backgroundColor: '#dfe6e9',
    },
    name: {
        fontSize: 13,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 5,
        color: '#2d3436',
    },
    date: {
        fontSize: 11,
        color: '#636e72',
        marginTop: 2,
    },
    location: {
        fontSize: 11,
        color: '#0984e3',
        textAlign: 'center',
        marginTop: 1,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginVertical: 10,
    },
    noEventsText: {
        textAlign: 'center',
        color: '#7f8c8d',
        marginTop: 10,
    },
});

export default LatestEvents;
