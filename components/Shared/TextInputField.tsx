import { View, Text, TextInput, StyleSheet } from 'react-native';
import React from 'react';
import Colors from '@/app/constants/Colors';

type TextInputFieldProps = {
  label: string;
  onChangeText: (text: string) => void;
  value?: string;
  password?: boolean;
  placeholder?: string;
};

export default function TextInputField({
  label,
  onChangeText,
  value,
  password = false,
  placeholder,
}: TextInputFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.textInput}
        secureTextEntry={password}
        onChangeText={onChangeText}
        value={value}
        placeholder={placeholder || label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  textInput: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    fontSize: 16,
    backgroundColor: Colors.WHITE,
  },
});