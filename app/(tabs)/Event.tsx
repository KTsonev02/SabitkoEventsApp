import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import Button from '@/components/Shared/Button';
import axios from 'axios';
import EventCard from '@/components/Events/EventCard';
import Colors from '../constants/Colors';
import { set } from 'date-fns';
import { AuthContext } from '@/context/AuthContext';

export default function Event() {
  const router = useRouter();
  const [eventList, setEventList] = useState();
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const {user} = useContext(AuthContext);
  
  useEffect(() => {
    if (selectedTab === 0) {
      GetAllEvents();
    } else {
      GetUserEvents();
    }
  }, [selectedTab]);

  const GetAllEvents=async()=>{
    setLoading(true);
    const result = await axios.get(process.env.EXPO_PUBLIC_HOST_URL+'/events')
    console.log(result.data);
    setEventList(result.data);
    setLoading(false);
  }

  const GetUserEvents = async () => {
    setLoading(true);
    const result = await axios.get(process.env.EXPO_PUBLIC_HOST_URL+'/event-register?email='+user?.email);
    console.log(result.data);
    setEventList(result.data);
    setLoading(false);
  }

  return (
    <View>
      <View style={{
        padding: 20,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Text style={{
          fontSize: 30,
          fontWeight: 'bold',
        }}>Events</Text>
        <Button text='  +  ' onPress={() => router.push('/add-event')} />
      </View>
  
      <View style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 20,
        padding: 15,
        paddingHorizontal: 30
      }}>
        <Pressable onPress={() => setSelectedTab(0)}>
          <Text style={[styles.tabtext, 
            {backgroundColor: selectedTab === 0 ? Colors.PRIMARY : Colors.WHITE,
             color: selectedTab === 0 ? Colors.WHITE : Colors.PRIMARY}
          ]}>Upcoming</Text>
        </Pressable>
        <Pressable onPress={() => setSelectedTab(1)}>
          <Text style={[styles.tabtext, 
            {backgroundColor: selectedTab === 1 ? Colors.PRIMARY : Colors.WHITE,
             color: selectedTab === 1 ? Colors.WHITE : Colors.PRIMARY}
          ]}>Registered</Text>
        </Pressable>
      </View>
  
      {loading ? (
        <ActivityIndicator size="large" color={Colors.PRIMARY} style={{ marginTop: 50 }} />
        
      ) : (
        <FlatList
          data={eventList}
          renderItem={({ item, index }) => (
            <EventCard {...item} key={index} isRegistered={selectedTab === 1} />
          )}
        />
      )}
    </View>
  );
}
  

const styles = StyleSheet.create({
    tabtext:{
        padding: 4, 
        fontSize: 20, 
        paddingHorizontal: 15, 
        borderRadius: 99
    }
})