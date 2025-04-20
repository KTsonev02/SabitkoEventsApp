import { View, Text, Image } from 'react-native'
import React, { useContext, useState, useEffect } from 'react'
import Colors from '@/app/constants/Colors'
import Button from '../Shared/Button'
import { AuthContext } from '@/context/AuthContext'
import axios from 'axios'

export type CLUB = {
    id: number,
    name: string,
    club_logo: string,
    about: string,
    createdon: string
    isFollowed: boolean
    refreshData: () => void
}

export default function ClubCard(club: CLUB) {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [isFollowed, setIsFollowed] = useState(club.isFollowed);

    // Синхронизираме локалното състояние с пропса при промяна
    useEffect(() => {
        setIsFollowed(club.isFollowed);
    }, [club.isFollowed]);

    const onFollowBtnClick = async () => {
        if (!user?.email) return;
        setLoading(true);
    
        try {
            if (isFollowed) {
                await axios.delete(
                    `${process.env.EXPO_PUBLIC_HOST_URL}/clubfollower?u_email=${user.email}&club_id=${club.id}`
                );
            } else {
                await axios.post(
                    `${process.env.EXPO_PUBLIC_HOST_URL}/clubfollower`,
                    {
                        u_email: user.email,
                        clubId: club.id,
                    }
                );
            }
            // Първо обновяваме локалното състояние за по-държавен отговор
            setIsFollowed(!isFollowed);
            // После синхронизираме с API
            club.refreshData();
        } catch (error) {
            console.error("Follow/Unfollow failed:", error);
            // Връщаме състоянието при грешка
            setIsFollowed(isFollowed);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <View style={{
            flex: 1,
            padding: 15,
            backgroundColor: Colors.WHITE,
            margin: 10,
            marginHorizontal: 10,
            display: 'flex',
            alignItems: 'center',
            borderRadius: 15
        }}>
            <Image 
                source={{ uri: club.club_logo }} 
                style={{
                    width: 80,
                    height: 80,
                    borderRadius: 99
                }} 
            />
            <Text style={{
                fontSize: 16,
                fontWeight: 'bold'
            }}>
                {club.name}
            </Text>
            <Text
                numberOfLines={2}
                style={{
                    color: Colors.GRAY
                }}>
                {club.about}
            </Text>

            <Button
                text={isFollowed ? 'Unfollow' : 'Follow'}
                loading={loading}
                outline={isFollowed}
                onPress={onFollowBtnClick}
            />
        </View>
    )
}