import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator, Pressable } from 'react-native';
import React, { useContext, useState, useEffect } from 'react';
import Colors from '../../constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import TextInputField from '@/components/Shared/TextInputField';
import { AuthContext } from '@/context/AuthContext';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import Button from '@/components/Shared/Button';
import moment from 'moment';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { upload } from 'cloudinary-react-native';
import { cld, options } from '@/configs/CloudinaryConfig';
import { ScrollView } from 'react-native';

export default function EditEvent() {
  const { id } = useLocalSearchParams();
  const [image, setImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const { user } = useContext(AuthContext);
  const [eventName, setEventName] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [link, setLink] = useState<string>('');
  const [time, setTime] = useState('Select Time');
  const [date, setDate] = useState('Select Date');
  const [openTimePicker, setOpenTimePicker] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [mapPreview, setMapPreview] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState('');
  const categories = ['Music', 'Education', 'Business', 'Technology', 'Sport'];
  const LOCATIONIQ_API_KEY = 'pk.ec03b49d319c22cc4569574c50e8a04d';
  const router = useRouter();
  const numericId = Number(id); // Преобразувай го в число

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await axios.get(`http://192.168.0.106:8082/events?id=${id}`);
        if (response.data && typeof response.data === 'object') {
          const event = response.data;
          console.log('Fetched event data:', event);
  
          // Задаване на всички стойности
          setEventName(event.name || '');
          setLocation(event.location || '');
          setLink(event.link || '');
          setCategory(event.category || '');
          setOriginalImage(event.bannerurl || null);
  
          // Форматиране на датата и часа
          if (event.event_date) {
            const date = new Date(event.event_date);
            setSelectedDate(date);
            setDate(moment(date).format('MMMM Do YYYY'));
          }
  
          if (event.event_time) {
            const time = new Date(`1970-01-01T${event.event_time}`);
            setSelectedTime(time);
            setTime(moment(time).format('h:mm A'));
          }
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Failed to fetch event:', error);
        Alert.alert('Error', 'Failed to load event data');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchEventData();
  }, [id]);
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const generateMapPreview = async (address: string) => {
    if (!address) {
      setMapPreview(null);
      return;
    }

    setMapLoading(true);
    try {
      const response = await axios.get(
        `https://us1.locationiq.com/v1/search`,
        {
          params: {
            q: address,
            key: LOCATIONIQ_API_KEY,
            format: 'json',
            limit: 1,
            'accept-language': 'bg',
            countrycodes: 'bg'
          }
        }
      );

      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        if (lat && lon) {
          const mapUrl = `https://maps.locationiq.com/v3/staticmap?key=${LOCATIONIQ_API_KEY}&center=${lat},${lon}&zoom=15&size=600x300&markers=icon:small-red-cutout|${lat},${lon}`;
          setMapPreview(mapUrl);
        } else {
          setMapPreview(null);
        }
      }
    } catch (error) {
      console.error("Map error:", error);
      setMapPreview(null);
    } finally {
      setMapLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (location) generateMapPreview(location);
    }, 1000);

    return () => clearTimeout(timer);
  }, [location]);

  const onTimeChange = (event: any, timeValue: Date | undefined) => {
    setOpenTimePicker(false);
    if (timeValue) {
      setSelectedTime(timeValue);
      setTime(moment(timeValue).format('h:mm A'));
    }
  };

  const onDateChange = (event: any, dateValue: Date | undefined) => {
    setOpenDatePicker(false);
    if (dateValue) {
      setSelectedDate(dateValue);
      setDate(moment(dateValue).format('MMMM Do YYYY'));
    }
  };

  const handleUpdateEvent = async () => {
    if (!eventName || !location || !link || !selectedDate || !selectedTime || !category) {
        Alert.alert('Missing Info', 'Please fill all required fields');
        return;
    }

    try {
        let imageUrl = originalImage;

        // Upload new image if changed
        if (image) {
            const uploadResponse = await new Promise<any>((resolve, reject) => {
                upload(cld, {
                    file: image,
                    options: options,
                    callback: (error, resp) => {
                        if (error) reject(error);
                        else resolve(resp);
                    }
                });
            });

            if (uploadResponse?.url) {
                imageUrl = uploadResponse.url;
            }
        }

        // Get coordinates
        let lat = null;
        let lon = null;
        try {
            const response = await axios.get(
                `https://us1.locationiq.com/v1/search`,
                {
                    params: {
                        q: location,
                        key: LOCATIONIQ_API_KEY,
                        format: 'json',
                        limit: 1,
                        'accept-language': 'bg',
                        countrycodes: 'bg'
                    }
                }
            );

            if (response.data.length > 0) {
                lat = response.data[0]?.lat || null;
                lon = response.data[0]?.lon || null;
            }
        } catch (geoError) {
            console.error('Geocoding error:', geoError);
        }

        const eventData = {
            name: eventName,
            bannerUrl: imageUrl,
            location: location,
            link: link,
            eventDate: moment(selectedDate).format('YYYY-MM-DD'),
            eventTime: moment(selectedTime).format('HH:mm'),
            lat: parseFloat(lat), // Преобразуване в число
            lon: parseFloat(lon), // Преобразуване в число
            category: category
        };

        console.log('Event Data:', eventData);

        // Проверка на URL адреса
        const patchUrl = `${process.env.EXPO_PUBLIC_HOST_URL}/events?id=${id}`;
        console.log('PATCH URL:', patchUrl);

        const result = await axios.patch(patchUrl, eventData);
        Alert.alert('Success', 'Event updated successfully!', [
            {
                text: 'OK',
                onPress: () => router.back(),
            },
        ]);
    } catch (error) {
        console.error('Update error:', error);
        Alert.alert('Error', 'Failed to update event!');
    }
};

  const handleDeleteEvent = async () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${process.env.EXPO_PUBLIC_HOST_URL}/events`, {
                data: { id }
              });
              Alert.alert('Success', 'Event deleted successfully', [
                {
                  text: 'OK',
                  onPress: () => router.replace('/Event'),
                },
              ]);
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete event');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Edit Event</Text>

      <TouchableOpacity onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : originalImage ? (
          <Image source={{ uri: originalImage }} style={styles.image} />
        ) : (
          <Image source={require('../../../assets/images/upload_image.jpg')} style={styles.image} />
        )}
      </TouchableOpacity>

      <TextInputField 
        label="Event Name" 
        value={eventName}
        onChangeText={setEventName} 
      />

      <Text style={styles.label}>Choose Category</Text>
      <View style={styles.categoryContainer}>
        {categories.map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setCategory(cat)}
            style={[
              styles.categoryButton,
              category === cat && styles.selectedCategoryButton
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                category === cat && styles.selectedCategoryText
              ]}
            >
              {cat}
            </Text>
          </Pressable>
        ))}
      </View>

      <TextInputField
        label="Location"
        value={location}
        onChangeText={(text) => {
          setLocation(text);
          setMapPreview(null);
        }}
      />

      {mapLoading ? (
        <ActivityIndicator size="large" color={Colors.PRIMARY} style={styles.mapLoader} />
      ) : mapPreview ? (
        <Image
          source={{ uri: mapPreview }}
          style={styles.mapImage}
          onError={() => Alert.alert('Error', 'Failed to load map preview')}
        />
      ) : null}

      <TextInputField 
        label="Link For Event Details" 
        value={link}
        onChangeText={setLink} 
      />

      <View style={styles.datetimeContainer}>
        <Button text={date} outline={true} onPress={() => setOpenDatePicker(true)} />
        <Button text={time} outline={true} onPress={() => setOpenTimePicker(true)} />
      </View>

      {openDatePicker && (
        <RNDateTimePicker
          mode="date"
          value={selectedDate || new Date()}
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {openTimePicker && (
        <RNDateTimePicker
          mode="time"
          value={selectedTime || new Date()}
          onChange={onTimeChange}
        />
      )}

      <View style={styles.buttonGroup}>
        <Button 
          text="Update Event" 
          onPress={handleUpdateEvent} 
        />
        <Button 
          text="Delete Event" 
          onPress={handleDeleteEvent} 
          outline={true}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: Colors.WHITE,
    paddingBottom: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedCategoryButton: {
    backgroundColor: Colors.PRIMARY,
  },
  categoryText: {
    color: '#333',
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
    alignSelf: 'center',
  },
  datetimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  mapImage: {
    height: 200,
    width: '100%',
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  mapLoader: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonGroup: {
    marginTop: 20,
  },
  updateButton: {
    marginBottom: 15,
  },
  deleteButton: {
    borderColor: Colors.WHITE,
  },
  deleteButtonText: {
    color: Colors.WHITE,
  },
});