import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
  Platform,
  ActivityIndicator
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';

const cloudName = 'dyf8orncl';
const uploadPreset = 'sabitko_preset';

export default function EventForm() {
  const { id } = useLocalSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [eventName, setEventName] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState('');
  const [link, setLink] = useState('');
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string>(); 
  const router = useRouter();

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setBannerUrl(result.assets[0].uri);
      setExistingImageUrl(null);
    }
  };

  const validateForm = (): boolean => {
    if (!eventName || (!bannerUrl && !existingImageUrl) || !location || !link) {
      Alert.alert('Error', 'Please fill all required fields');
      return false;
    }
    return true;
  };

  const uploadImageToCloudinary = async (imageUri: string) => {
    const data = new FormData();
    data.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'uploaded_image.jpg',
    } as any);
    data.append('upload_preset', uploadPreset);
  
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: data,
      });
      const json = await res.json();
      return json.secure_url;
    } catch (err) {
      console.error('Image upload error:', err);
      throw err;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let imageUrl = existingImageUrl;
      
      if (bannerUrl) {
        imageUrl = await uploadImageToCloudinary(bannerUrl);
      }

      // Format date and time for PostgreSQL
      const eventDate = date.toISOString().split('T')[0];
      const eventTime = date.toTimeString().split(' ')[0];

      const eventData = {
        eventName,
        bannerUrl: imageUrl,
        location,
        link,
        eventDate,
        eventTime,
        email
      };

      // Send to your backend
      const response = await fetch('EXPO_PUBLIC_HOST_URL/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      Alert.alert('Success', 'Event created successfully!');
      router.replace('/(tabs)/Home');
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEventName('');
    setDate(new Date());
    setLocation('');
    setLink('');
    setBannerUrl(null);
    setExistingImageUrl(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>
        {isEditing ? 'Edit Event' : 'Create New Event'}
      </Text>

      <Text style={styles.label}>Event Name*</Text>
      <TextInput 
        style={styles.input} 
        value={eventName} 
        onChangeText={setEventName}
        placeholder="Enter event name"
      />

      <Text style={styles.label}>Banner Image*</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick}>
        {bannerUrl ? (
          <Image source={{ uri: bannerUrl }} style={styles.imagePreview} />
        ) : existingImageUrl ? (
          <Image source={{ uri: existingImageUrl }} style={styles.imagePreview} />
        ) : (
          <Text style={styles.placeholderText}>Select image</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Date & Time*</Text>
      <TouchableOpacity 
        onPress={() => setShowDatePicker(true)} 
        style={styles.input}
      >
        <Text>{date.toLocaleString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="datetime"
          display="default"
          onChange={(_, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <Text style={styles.label}>Location*</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="Enter location"
      />

      <Text style={styles.label}>Link*</Text>
      <TextInput
        style={styles.input}
        value={link}
        onChangeText={setLink}
        placeholder="Enter event link"
      />

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>
            {isEditing ? 'Save Changes' : 'Create Event'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#3a0ca3',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#3a0ca3',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  imagePicker: {
    height: 200,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  placeholderText: {
    color: '#ccc',
    fontSize: 18,
  },
  submitButton: {
    backgroundColor: '#3a0ca3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});