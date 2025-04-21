import { View, Text, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import React, { useContext, useState, useEffect } from 'react'
import Colors from '@/app/constants/Colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import Button from '../Shared/Button'
import { AuthContext } from '@/context/AuthContext'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import axios from 'axios'
import { router } from 'expo-router'

type EVENT = {
    id: number
    name: string
    bannerurl: string
    location: string
    link: string
    event_date: string
    event_time: string
    createdby: string
    username: string
    isRegistered: boolean
    lat?: number
    lon?: number
    category: string
}

const LOCATIONIQ_API_KEY = 'pk.ec03b49d319c22cc4569574c50e8a04d'

export default function EventCard({ event }: { event: EVENT }) {
    const { user } = useContext(AuthContext)
    const [mapLoading, setMapLoading] = useState(true)
    const [mapError, setMapError] = useState(false)

    const hasValidCoords = event?.lat !== undefined && event?.lon !== undefined
    const coords = {
        lat: hasValidCoords ? event.lat : 42.6977,
        lng: hasValidCoords ? event.lon : 23.3219,
    }

    useEffect(() => {
        if (!hasValidCoords) {
            setMapError(true)
        }
        setMapLoading(false)
    }, [event])

    const RegisterForEvent = () => {
        Alert.alert(
            'Потвърждение',
            'Желаете ли да се регистрирате за това събитие?',
            [
                { text: 'Не', style: 'cancel' },
                { text: 'Да', onPress: SaveEventRegistration }
            ]
        )
    }

    const SaveEventRegistration = async () => {
        if (!user?.email) {
            Alert.alert('Грешка', 'Липсва имейл на потребителя.')
            return
        }

        try {
            const result = await axios.post(
                `${process.env.EXPO_PUBLIC_HOST_URL}/event-register`,
                {
                    eventId: event.id,
                    userEmail: user.email,
                }
            )
            Alert.alert('Успех', 'Регистрацията е успешна!')
        } catch (error: any) {
            console.error('Registration error:', error?.response?.data || error.message)
            Alert.alert('Грешка', 'Неуспешна регистрация. Моля, опитайте отново.')
        }
    }

    const shareImage = async () => {
        try {
            const fileUri = FileSystem.documentDirectory + 'shared-image.jpg'
            const { uri } = await FileSystem.downloadAsync(event.bannerurl, fileUri)

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, {
                    dialogTitle: 'Сподели събитие',
                    mimeType: 'image/jpeg',
                })
            } else {
                Alert.alert('Грешка', 'Функцията за споделяне не е налична')
            }
        } catch (error) {
            console.error('Error sharing image:', error)
            Alert.alert('Грешка', 'Неуспешно споделяне')
        }
    }

    const mapUrl = `https://maps.locationiq.com/v3/staticmap?key=${LOCATIONIQ_API_KEY}&center=${coords.lat},${coords.lng}&zoom=15&size=600x300&markers=icon:small-red-cutout|${coords.lat},${coords.lng}`

    return (
        <View style={styles.container}>
            <Image source={{ uri: event.bannerurl }} style={styles.eventImage} />
            <Text style={styles.eventName}>{event.name}</Text>
            <Text style={styles.eventCreator}>Организатор: {event.username}</Text>
            <Text style={styles.eventCategory}>Категория: {event.category}</Text>

            <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={20} color={Colors.PRIMARY} />
                <Text style={styles.detailText}>{event.location}</Text>
            </View>

            {mapLoading ? (
                <View style={styles.mapPlaceholder}>
                    <ActivityIndicator size="large" color={Colors.PRIMARY} />
                </View>
            ) : mapError ? (
                <View style={styles.mapPlaceholder}>
                    <Text style={styles.errorText}>Картата не е налична</Text>
                </View>
            ) : (
                <Image
                    source={{ uri: mapUrl }}
                    style={styles.mapImage}
                    onError={() => setMapError(true)}
                    onLoad={() => console.log("Картата е заредена успешно")}
                />
            )}

            <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={20} color={Colors.PRIMARY} />
                <Text style={styles.detailText}>
                    {new Date(event.event_date).toLocaleDateString('bg-BG')} в {event.event_time}
                </Text>
            </View>

            {user?.email === event.createdby && (
                <Button
                    text="Редактирай събитието"
                    outline
                    onPress={() => router.push(`/edit-event/${event.id}`)}
                />
            )}

            {!event.isRegistered ? (
                <View style={styles.buttonGroup}>
                    <Button text="Сподели" outline onPress={shareImage} />
                    <Button text="Регистрирай се" onPress={RegisterForEvent} />
                </View>
            ) : (
                <Button
                    text="Отмени регистрация"
                    outline
                    onPress={() => console.log('Unregister')}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: Colors.WHITE,
        borderRadius: 12,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
        eventCategory: {
            fontSize: 14,
            color: Colors.GRAY,
            marginBottom: 12,
            fontStyle: 'italic',
        },
    eventImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 12,
    },
    eventName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.BLACK,
        marginBottom: 4,
    },
    eventCreator: {
        fontSize: 14,
        color: Colors.GRAY,
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 6,
    },
    detailText: {
        fontSize: 14,
        color: Colors.BLACK,
    },
    mapPlaceholder: {
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.GRAY || '#f0f0f0',
        borderRadius: 8,
        marginVertical: 12,
    },
    mapImage: {
        height: 180,
        width: '100%',
        borderRadius: 8,
        marginVertical: 12,
    },
    errorText: {
        color: Colors.ERROR || '#ff0000',
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        gap: 12,
    },
    button: {
        flex: 1,
    },
})
