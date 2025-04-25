import { View, Text, Image } from 'react-native'
import React, { useContext } from 'react'
import { Tabs } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons';
import { AuthContext } from '@/context/AuthContext';


export default function TabLayout() {
  const {user}=useContext(AuthContext);
  return (
    <View style={{ flex: 1}}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#4C0099',
          headerShown: false,
        }}>
        <Tabs.Screen name = 'Home'
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={28} color={color} />
        }}/>
        <Tabs.Screen name = 'Event'
         options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={28} color={color} />
        }}/>
        <Tabs.Screen name = 'Clubs'
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="accessibility" size={28} color={color} />
        }}/>
        <Tabs.Screen name = 'Profile'
         options={{
          tabBarIcon: ({ color, size }) => <Image source={{uri:user?.image}}
          style={{
            width:'100%',
            height:"100%",  
            borderRadius:99
          }}
            />
  
        }}/>
      </Tabs>
    </View>
  )
}