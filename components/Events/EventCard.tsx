import { View, Text, Image, StyleSheet, Alert } from 'react-native'
import React, { useContext } from 'react'
import Colors from '@/app/constants/Colors'
import Ionicons from '@expo/vector-icons/Ionicons';
import Button from '../Shared/Button';
import { AuthContext } from '@/context/AuthContext';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import axios from 'axios';

type EVENT={
    id: number,
    name: string,
    bannerurl: string,
    location:string,
    link: string,
    event_date: string,
    event_time: string,
    createdby: string,
    username: string,
    isRegistered:boolean
}

export default function EventCard(event:EVENT) {
    const {user} = useContext(AuthContext);
    const RegisterForEvent = () => {
        Alert.alert(
            'Are you sure?',
            'Do you want to register?',
            [
                {
                    text: 'No',
                    onPress: () => {
                        console.log('Cancel');
                    },
                    style: 'cancel'
                },
                {
                    text: 'Yes',
                    onPress: () => {
                        SaveEventRegistration();
                    }
                }
            ]
        );
    };

    const SaveEventRegistration=async()=>{
        const result=await axios.post(process.env.EXPO_PUBLIC_HOST_URL+'/event-register',{
            eventId:event.id,
            userEmail:user?.email
        })
        console.log(result);

        if(result){
            Alert.alert('Great!', 'Successfully registered!');
        }
        else{
            Alert.alert('Error', 'Could not register. Please try again.');
        }
    }
    
    const shareImage = async () => {
        try{
            const fileUri = FileSystem.documentDirectory + 'shared-image.jpg';

            const { uri } = await FileSystem.downloadAsync(event.bannerurl, fileUri);

            if(await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, {
                    dialogTitle: 'Check out this image!',
                    mimeType: 'image/jpeg',
                    UTI: 'public.jpeg',
                });
            } else {
                Alert.alert('Error', 'Sharing is not available on this device.');
            }
        } catch (error){
            console.error('Error sharing image:', error);
            Alert.alert('Error', 'Could not share image.');
        }
    }
  return (
    <View style={{
        padding: 20,
        backgroundColor: Colors.WHITE,
        marginVertical: 10,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        marginBottom: 30
    }}>
        <Image source={{uri:event.bannerurl}}
        style={{
            height: 260,
            objectFit: 'contain',
            borderRadius: 25,
        }}/>
        <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            marginTop: 10,
            color: '#000',
        }}
        >{event.name}</Text>
        <Text style={{
            fontSize: 15,
            fontWeight: 'bold',
            marginTop: 10,
            color: Colors.GRAY,
        }}
        >Event By {event.username}</Text>
        <View style={styles.subContainer}>
        <Ionicons name="location-outline" size={24} color="black" />
        <Text style={{color: Colors.GRAY, fontSize: 15}}>{event.location}</Text>
        </View>
        <View style={styles.subContainer}>
        <Ionicons name="calendar-clear-outline" size={24} color="black" />
        <Text style={{color: Colors.GRAY, fontSize: 15}}>{event.event_date} at {event.event_time}</Text>
        </View>

        {!event.isRegistered? <View style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',

        }}>
        <Button text='Share' outline={true} fullWidth={true} onPress={()=> shareImage()} />
        <Button text='Register' fullWidth={true} onPress={RegisterForEvent} />
        </View>:

        <Button text='Unregister' outline={true} onPress={()=> console.log()} />
    }
    </View>
  )
}

const styles = StyleSheet.create({
    subContainer:{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        gap: 5
    }
})