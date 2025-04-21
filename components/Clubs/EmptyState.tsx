import { View, Text, Image } from 'react-native'
import React from 'react'
import Button from '../Shared/Button'
import { useRouter } from 'expo-router'

export default function EmptyState() {
     const router = useRouter();
  return (
    <View style={{
        display: 'flex',
        alignItems: 'center',
        marginTop: 80
    }}>
        <Image source={require('../../assets/images/no_team.jpg')} 
        style={{width: 200, height: 200}}
        />
        <Text style={{
            fontSize: 22,
            textAlign: 'center',
            marginTop: 10
        }}>You are not following any Teams/ Clubs </Text>
        <Button text='Explore Clubs/Teams' 
        onPress={() => router.push('../explore-clubs') }/>
    </View>
  )
}