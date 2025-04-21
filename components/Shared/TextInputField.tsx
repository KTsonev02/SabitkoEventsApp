import { View, Text, TextInput, StyleSheet } from 'react-native'
import React from 'react'

type TextInputFieldProps = {
    label: string,
    onChangeText: (text: string) => void,
    password?:boolean
    value?: string;
}

export default function TextInputField({label, onChangeText, password=false}: TextInputFieldProps) {
  return (
    <View>
        <Text>{label}</Text>
        <TextInput placeholder={label} style={styles.textInput} 
        secureTextEntry={password} 
        onChangeText={onChangeText} 
        />
    </View>
  )
}

const styles = StyleSheet.create({
    textInput: {
        padding: 15,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        marginTop: 5,
        fontSize: 16,
    }
})