import { View, Text, Touchable, TouchableOpacity, ActivityIndicator } from 'react-native'
import React from 'react'

type ButtonProps = {
    text: string,
    onPress: () => void
    loading?: boolean
}

export default function Button({text, onPress, loading=false}: ButtonProps) {
  return (
    <TouchableOpacity 
    onPress={onPress}
    style={{
                padding: 20,
                marginTop: 20,
                borderRadius: 20,
                marginLeft: 30,
                marginRight: 30,
                backgroundColor: 'black',
                alignItems: 'center',
          }}>
            {loading? <ActivityIndicator/>:
                <Text style={{ color: 'white', fontSize: 20 }}>{text}</Text>}
            </TouchableOpacity>
  )
}