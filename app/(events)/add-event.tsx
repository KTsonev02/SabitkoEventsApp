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
import MapView, { Marker } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { db } from 'configs/FirebaseConfig'; 
import { addDoc, collection, doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';
import { cld, options } from '@/configs/CloudinaryConfig';

const LOCATIONIQ_API_KEY = 'pk.ec03b49d319c22cc4569574c50e8a04d';
const cloudName = 'dyf8orncl';
const uploadPreset = 'sabitko_preset';

export default function EventForm() {
  const { id } = useLocalSearchParams(); // Ако има ID, значи редактираме съществуващо събитие
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [location, setLocation] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const router = useRouter();

  // Зареждане на събитие за редактиране
  useEffect(() => {
    if (id) {
      const loadEvent = async () => {
        setLoading(true);
        try {
          const docRef = doc(db, 'events', id as string);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const eventData = docSnap.data();
            setTitle(eventData.title);
            setDescription(eventData.description);
            setLocation(eventData.location);
            setLocationQuery(eventData.location);
            setDate(eventData.date.toDate());
            setCoords(eventData.coords);
            setExistingImageUrl(eventData.imageUrl);
            setIsEditing(true);
          } else {
            Alert.alert('Грешка', 'Събитието не е намерено');
            router.back();
          }
        } catch (error) {
          console.error('Грешка при зареждане на събитие:', error);
          Alert.alert('Грешка', 'Неуспешно зареждане на събитие');
        } finally {
          setLoading(false);
        }
      };
      
      loadEvent();
    }
  }, [id]);

  useEffect(() => {
    const fetchLocations = async () => {
      if (locationQuery.length > 2) {
        setLocationLoading(true);
        try {
          const response = await axios.get(
            `https://us1.locationiq.com/v1/search`,
            {
              params: {
                q: locationQuery,
                key: LOCATIONIQ_API_KEY,
                format: 'json',
                addressdetails: 1,
                limit: 5,
                'accept-language': 'bg',
                countrycodes: 'bg'
              }
            }
          );
          setLocationSuggestions(response.data);
        } catch (error) {
          console.error('Грешка при търсене на локации:', error);
          Alert.alert('Грешка', 'Неуспешно зареждане на локации');
        } finally {
          setLocationLoading(false);
        }
      } else {
        setLocationSuggestions([]);
      }
    };

    const timeout = setTimeout(fetchLocations, 800);
    return () => clearTimeout(timeout);
  }, [locationQuery]);

  const handleLocationSelect = (selectedLocation: any) => {
    setLocation(selectedLocation.display_name);
    setCoords({
      latitude: parseFloat(selectedLocation.lat),
      longitude: parseFloat(selectedLocation.lon),
    });
    setLocationQuery(selectedLocation.display_name);
    setLocationSuggestions([]);
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setExistingImageUrl(null); // Ако изберем нова снимка, премахваме старата URL
    }
  };

  const validateForm = (): boolean => {
    if (!title || (!image && !existingImageUrl) || !location || !description) {
      Alert.alert('Грешка', 'Моля, попълнете всички задължителни полета.');
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
      console.error('Грешка при качване на изображението:', err);
      throw err;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let imageUrl = existingImageUrl;
      
      // Ако има нова снимка, качваме я
      if (image) {
        imageUrl = await uploadImageToCloudinary(image);
      }

      const eventData = {
        title,
        description,
        location,
        imageUrl,
        date: Timestamp.fromDate(date),
        coords,
        updatedAt: Timestamp.now(),
      };

      if (isEditing && id) {
        // Редактиране на съществуващо събитие
        await updateDoc(doc(db, 'events', id as string), eventData);
        Alert.alert('Успех', 'Събитието е обновено!');
      } else {
        // Създаване на ново събитие
        await addDoc(collection(db, 'events'), {
          ...eventData,
          createdAt: Timestamp.now(),
        });
        Alert.alert('Успех', 'Събитието е създадено!');
      }
      
      router.replace('/(tabs)/Home');
      resetForm();
    } catch (error) {
      console.error('Грешка:', error);
      Alert.alert('Грешка', error instanceof Error ? error.message : 'Неуспешно запазване');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDate(new Date());
    setLocationQuery('');
    setLocation('');
    setCoords(null);
    setDescription('');
    setImage(null);
    setExistingImageUrl(null);
  };

  if (loading && isEditing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3a0ca3" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>
        {isEditing ? 'Редактирай събитие' : 'Създай ново събитие'}
      </Text>

      <Text style={styles.label}>Заглавие*</Text>
      <TextInput 
        style={styles.input} 
        value={title} 
        onChangeText={setTitle}
        placeholder="Въведете заглавие"
      />

      <Text style={styles.label}>Снимка*</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick}>
        {image ? (
          <Image source={{ uri: image }} style={styles.imagePreview} />
        ) : existingImageUrl ? (
          <Image source={{ uri: existingImageUrl }} style={styles.imagePreview} />
        ) : (
          <Text style={styles.placeholderText}>Изберете снимка</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Дата*</Text>
      <TouchableOpacity 
        onPress={() => setShowDatePicker(true)} 
        style={styles.input}
      >
        <Text>{date.toLocaleDateString('bg-BG')}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(_, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <Text style={styles.label}>Локация*</Text>
      <TextInput
        style={styles.input}
        value={locationQuery}
        onChangeText={setLocationQuery}
        placeholder="Търсене на локация..."
      />
      
      {locationLoading && <ActivityIndicator style={styles.loader} />}

      {locationSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {locationSuggestions.map((item, index) => (
            <TouchableOpacity
              key={`${item.lat}-${item.lon}`}
              style={styles.suggestionItem}
              onPress={() => handleLocationSelect(item)}
            >
              <Text>{item.display_name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {coords && (
        <MapView
          style={styles.map}
          initialRegion={{
            ...coords,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker coordinate={coords} />
        </MapView>
      )}

      <Text style={styles.label}>Описание*</Text>
      <TextInput
        style={[styles.input, styles.descriptionInput]}
        value={description}
        onChangeText={setDescription}
        placeholder="Описание на събитието"
        multiline
        numberOfLines={4}
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
            {isEditing ? 'Запази промените' : 'Добави събитие'}
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
  loader: {
    marginBottom: 10,
  },
  suggestionsContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    maxHeight: 200,
    marginBottom: 20,
    overflow: 'hidden',
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  map: {
    width: '100%',
    height: 200,
    marginBottom: 20,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
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