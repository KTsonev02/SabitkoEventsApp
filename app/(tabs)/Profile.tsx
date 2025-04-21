import { View, Text, Image, FlatList, Touchable, TouchableOpacity} from 'react-native'
import React, { useContext, useState } from 'react'
import { AuthContext } from '@/context/AuthContext'
import Colors from '../constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '@/configs/FirebaseConfig';

const profileOptions=[
  {
    name: 'Add Post',
    path: '/add-post',
    icon: "add-circle-outline"
  },
  {
    name: 'My Events',
    path: '/Event',
    icon: "calendar-number-outline"
  },
  {
    name: 'Log Out',
    path: 'logout',
    icon: "log-out-outline"
  }
]

export default function Profile() {
  const {user, setUser} = useContext(AuthContext);
  const router = useRouter();
  const OnPressOption = (item: any) => {
    if (item.path === 'logout') {
      signOut(auth)
        .then(() => {
          setUser(null);
          router.replace('/landing');
        })
        .catch((error) => {
          console.error('Logout error:', error);
        });
    } else {
      router.push(item.path);
    }
  };
  return (
    <View style={{
      padding: 20,
    }}>
      <Text style={{
        fontSize: 30,
        fontWeight: 'bold',
      }}>Profile</Text>

      <View style={{
        display: 'flex',
        alignItems: 'center',
        marginTop: 30,
      }}>
      <Image source={{uri: user?.image}} style={{
        width: 150,
        height: 150,
        borderRadius: 90
      }} />
      <Text style={{
        marginTop: 7,
        fontSize: 25,
        fontWeight: 'bold',
      }}>{user?.name}</Text>
      <Text style={{
        marginTop: 7,
        color: Colors.GRAY, 
        fontSize: 18,
      }}>{user?.email}</Text>
      </View>

      <FlatList
        data={profileOptions}
        renderItem={({item, index} :any)=> (
          <TouchableOpacity onPress={() => OnPressOption(item)}
          style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 8,
              padding: 10,
              margin: 10,
              marginTop: 15,
              borderWidth:0.4,
              borderRadius: 8,
              alignItems: 'center',
          }}> 
            <Ionicons name={item.icon} size={34} color= {Colors.PRIMARY} />
            <Text style={{
              fontSize: 20,
            }}>{item.name}</Text>
          </TouchableOpacity>
        )}
        
      />
    </View>
  )
}