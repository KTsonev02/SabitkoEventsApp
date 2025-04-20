import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import React, { useContext, useState, useEffect } from 'react';
import Colors from '../../constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import TextInputField from '@/components/Shared/TextInputField';
import { AuthContext } from '@/context/AuthContext';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import Button from '@/components/Shared/Button';
import moment from 'moment';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { upload } from 'cloudinary-react-native';
import { cld, options } from '@/configs/CloudinaryConfig';

export default function AddEvent() {
  const [image, setImage] = useState<string | null>(null);
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
  const router = useRouter();

  const LOCATIONIQ_API_KEY = 'pk.ec03b49d319c22cc4569574c50e8a04d'; // Вашият API ключ

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
        console.log('Coordinates:', lat, lon); // Лог на координатите

        // Ако координатите са валидни, генерирай картата
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

  const onSubmitBtnPress = async () => {
    if (!eventName || !location || !link || !selectedDate || !selectedTime || !image) {
      Alert.alert('Missing Info', 'Please fill all fields and upload image');
      return;
    }

    try {
      upload(cld, {
        file: image,
        options: options,
        callback: async (error, resp) => {
          if (error || !resp?.url) {
            console.error('Cloudinary Upload Error:', error);
            Alert.alert('Error', 'Something went wrong while uploading image.');
            return;
          }

          try {
            // Получаване на координатите на локацията
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

            let lat = null;
            let lon = null;
            if (response.data.length > 0) {
              lat = response.data[0]?.lat || null;
              lon = response.data[0]?.lon || null;
            }

            if (!lat || !lon) {
              Alert.alert('Error', 'Invalid location coordinates');
              return;
            }

            // Създаване на събитието
            const result = await axios.post(`${process.env.EXPO_PUBLIC_HOST_URL}/events`, {
              eventName: eventName,
              bannerUrl: resp.url,
              location: location,
              lat: lat,
              lon: lon,
              link: link,
              eventDate: moment(selectedDate).format('YYYY-MM-DD'),
              eventTime: moment(selectedTime).format('HH:mm'),
              email: user?.email
            });

            console.log('Event Added:', result.data);

            Alert.alert('Success', 'Event created successfully!', [
              {
                text: 'OK',
                onPress: () => router.replace('/Event'),
              },
            ]);
          } catch (postError: any) {
            console.error('API Post Error:', postError.response?.data || postError.message);
            Alert.alert('Error', 'Failed to save event.');
          }
        },
      });
    } catch (err) {
      console.error('Unexpected Error:', err);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Event</Text>

      <TouchableOpacity onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Image source={require('../../../assets/images/upload_image.jpg')} style={styles.image} />
        )}
      </TouchableOpacity>

      <TextInputField label="Event Name" onChangeText={setEventName} />

      <TextInputField
        label="Location"
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

      <TextInputField label="Link For Event Details" onChangeText={setLink} />

      <View style={styles.datetimeContainer}>
        <Button text={date} outline={true} onPress={() => setOpenDatePicker(true)} />
        <Button text={time} outline={true} onPress={() => setOpenTimePicker(true)} />
      </View>

      {openDatePicker && (
        <RNDateTimePicker
          mode="date"
          value={selectedDate || new Date()}
          onChange={onDateChange}
        />
      )}

      {openTimePicker && (
        <RNDateTimePicker
          mode="time"
          value={selectedTime || new Date()}
          onChange={onTimeChange}
        />
      )}

      <Button text="Submit" onPress={onSubmitBtnPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: Colors.WHITE,
    height: '100%',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 20,
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
});
