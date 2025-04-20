import { View, Text, Image } from 'react-native'
import React from 'react'
import { Colors } from 'react-native/Libraries/NewAppScreen';
import Ionicons from '@expo/vector-icons/Ionicons';
import moment from 'moment';
type USER_AVATAR = {
  name: string;
  image: string;
  date: string;
}

export default function UserAvatar({name, image, date} : USER_AVATAR) {
  return (
    <View style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
        <View style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 10,
          alignItems: 'center',
        }}>
        <Image source={{uri:image}} style={{
          width:60,
          height:60,
          borderRadius: 99
        }} />
        <View>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold'
          }}>{name}</Text>
          <Text style={{
            color: Colors.GRAY
          }}>{moment(date).fromNow() }</Text>
        </View>
        </View>
        <Ionicons name="ellipsis-vertical" size={24} color="black" />
    </View>
  )
}