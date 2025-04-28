// import { useRouter, useLocalSearchParams } from 'expo-router';
// import React, { useEffect, useState } from 'react';
// import { View, Text, ActivityIndicator, Alert, StyleSheet } from 'react-native';
// import axios from 'axios';

// type Event = {
//     id: number;
//     name: string;
//     location: string;
//     event_date: string;
//     event_time: string;
//     // Добавете други полета, ако е необходимо
// };

// export default function EditEvent() {
//     const { id } = useLocalSearchParams<{ id: string }>();
//     const router = useRouter();
//     const [event, setEvent] = useState<Event | null>(null); // Дефинираме тип за `event`
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         if (!id) {
//             Alert.alert('Грешка', 'Липсва ID на събитието.');
//             router.replace('/'); // Навигира обратно към началната страница
//             return;
//         }

//         const fetchEvent = async () => {
//             try {
//                 const response = await axios.get(`${process.env.EXPO_PUBLIC_HOST_URL}/events/${id}`);
//                 setEvent(response.data);
//             } catch (error) {
//                 console.error('❌ Error fetching event:', error);
//                 Alert.alert('Грешка', 'Неуспешно зареждане на събитието.');
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchEvent();
//     }, [id]);

//     if (loading) {
//         return (
//             <View style={styles.loadingContainer}>
//                 <ActivityIndicator size="large" color="#3a0ca3" />
//             </View>
//         );
//     }

//     if (!event) {
//         return (
//             <View style={styles.errorContainer}>
//                 <Text style={styles.errorText}>Събитието не е намерено.</Text>
//             </View>
//         );
//     }

//     return (
//         <View style={styles.container}>
//             <Text style={styles.heading}>Редактиране на събитие</Text>
//             <Text>Име: {event.name}</Text>
//             <Text>Локация: {event.location}</Text>
//             <Text>Дата: {event.event_date}</Text>
//             <Text>Час: {event.event_time}</Text>
//             {/* Добавете формуляр за редактиране тук */}
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         padding: 16,
//         backgroundColor: '#fff',
//     },
//     heading: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         marginBottom: 16,
//     },
//     loadingContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     errorContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     errorText: {
//         fontSize: 18,
//         color: 'red',
//     },
// });
