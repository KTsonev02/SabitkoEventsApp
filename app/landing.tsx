import { View, Text, Image, Pressable } from 'react-native'
import React from 'react'
import Button from '@/components/Shared/Button'
import { useRouter } from 'expo-router'

export default function LandingScreen() {
    const router = useRouter();
  return (
    <View>
        <Image source={require('./../assets/images/events.jpg')} 
            style={{
                width: '100%',
                height: 480           
            }}
        />
        <View style={{
            padding: 20,
        }}>
            <Text style={{fontSize: 35, fontWeight: 'bold', textAlign: 'center', color: '#000'}}
            >Welcome to Sabitko</Text>
            <Text style={{fontSize: 18, marginTop: 20, textAlign: 'center', color: 'gray'}}>
                Sabitko is a platform that connects people with similar interests and hobbies. 
                Whether you're looking for a new friend, a workout buddy, or someone to share your passion with, 
                Sabitko is the perfect place to find your match.
            </Text>
        </View>

        <Button text='Get Started'
          onPress={() => router.push('/(auth)/SignUp')} loading={false}/>
           

        <View style={{
            padding: 20,
            marginTop: 10,
            borderRadius: 20,
            marginLeft: 30,
            marginRight: 30,
            backgroundColor: 'black',
            alignItems: 'center',
        }}>
           <Pressable onPress={() => router.push('/(auth)/SignIn')}>
                <Text style={{ color: 'white', fontSize: 10 }}>Already have an Account? Sign in Here!</Text>
            </Pressable>
        </View>
    </View>
  )
}