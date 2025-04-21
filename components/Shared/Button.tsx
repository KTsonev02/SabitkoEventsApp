import { View, Text, Touchable, TouchableOpacity, ActivityIndicator } from 'react-native'
import React from 'react'
import Colors from '@/app/constants/Colors'

type ButtonProps = {
    text: string,
    onPress: () => void
    loading?: boolean,
    outline?:boolean
    fullWidth?: boolean
}

export default function Button({text, onPress, loading=false, outline=false, fullWidth=false}: ButtonProps) {
  return (
    <TouchableOpacity 
    onPress={onPress}
    style={{
                padding: 20,
                marginTop: 20,
                borderRadius: 20,
                marginLeft: 30,
                marginRight: 30,
                backgroundColor: outline?Colors.WHITE: Colors.PRIMARY,
                borderColor: Colors.PRIMARY,
                borderWidth:outline?1:0,
                flex:fullWidth?1:0,
                alignItems: 'center',
          }}>
            {loading? <ActivityIndicator color={Colors.WHITE}/>:
                <Text style={{ 
                  fontSize: 20,
                  textAlign: 'center',
                  color: outline ? Colors.PRIMARY : Colors.WHITE

                  }}>{text}</Text>}
            </TouchableOpacity>
  )
}