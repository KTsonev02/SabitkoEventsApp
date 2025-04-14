import { View, Text, Image } from 'react-native'
import React, { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext';

export default function Header() {
    const {user} = useContext(AuthContext);
  return (
    <View style= {{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    }}>
        <View>
            <Text style={{
                fontSize: 30,
                fontWeight: 'bold',
            }}>Hey There!</Text>
            <Text style={{
                fontSize: 20,

            }}>Sabitko App</Text>
        </View>
        <Image source = {{uri: user?.image}} style={{
            width: 80,
            height: 80,
            borderRadius: 99
        }} />
    </View>
  )
}