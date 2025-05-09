import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator, Pressable } from 'react-native';
import React, { useContext, useState, useEffect } from 'react';
import Colors from '../../constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import TextInputField from '@/components/Shared/TextInputField';
import { AuthContext } from '@/context/AuthContext';
import Button from '@/components/Shared/Button';
import moment from 'moment';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { upload } from 'cloudinary-react-native';
import { cld, options } from '@/configs/CloudinaryConfig';
import { ScrollView } from 'react-native';
import RNDateTimePicker from '@react-native-community/datetimepicker';


export default function AddEvent() {
  const [image, setImage] = useState<string | null>(null);
  const { user } = useContext(AuthContext);
  const [eventName, setEventName] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [link, setLink] = useState<string>('');
  const [time, setTime] = useState('Select Time');
  const [date, setDate] = useState('Select Date');
  const [price, setPrice] = useState<string>(''); // Цена на събитието
  const [seats, setSeats] = useState<string>(''); // Брой седалки
  const [openTimePicker, setOpenTimePicker] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [mapPreview, setMapPreview] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState(false);
  const router = useRouter();
  const [category, setCategory] = useState('');
  const categories = ['Music', 'Education', 'Business', 'Technology', 'Sport'];
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
      if (location) {
        console.log("Location changed, generating map preview...");
        generateMapPreview(location);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [location]);

  const onSubmitBtnPress = async () => {
    if (!eventName || !location || !link || !selectedDate || !selectedTime || !image || !category || !price || !seats) {
      Alert.alert('Missing Info', 'Please fill all fields and upload image');
      return;
    }

    try {
      console.log("Starting image upload...");
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
            // Fetch coordinates for the location
            console.log("Fetching location coordinates...");
            const response = await axios.get(
              `https://us1.locationiq.com/v1/search`,
              {
                params: {
                  q: location,
                  key: LOCATIONIQ_API_KEY,
                  format: 'json',
                  limit: 1,
                }
              }
            );

            let lat = null;
            let lon = null;
            if (response.data.length > 0) {
              lat = response.data[0]?.lat || null;
              lon = response.data[0]?.lon || null;
            }

            console.log("Coordinates from LocationIQ:", lat, lon);

            // Prepare event data
            const eventData = {
              name: eventName,
              bannerUrl: resp.url, // Use the uploaded image URL
              location: location,
              link: link,
              eventDate: moment(selectedDate).format('YYYY-MM-DD'),
              eventTime: moment(selectedTime).format('HH:mm'),
              email: user?.email || '', // Ensure email is a string
              createdon: new Date().toISOString(),
              lat: lat || '', // Ensure lat is a string
              lon: lon || '', // Ensure lon is a string
              category: category,
              price: price, // Event price
              total_seats: seats,
                        };

            console.log('Sending event data:', eventData);

            // Create the event
            const result = await axios.post(`${process.env.EXPO_PUBLIC_HOST_URL}/events`, eventData);

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
    console.log("Time picker value:", timeValue);
    setOpenTimePicker(false);
    if (timeValue) {
      setSelectedTime(timeValue);
      setTime(moment(timeValue).format('h:mm A'));
    }
  };

  const onDateChange = (event: any, dateValue: Date | undefined) => {
    console.log("Date picker value:", dateValue);
    setOpenDatePicker(false);
    if (dateValue) {
      setSelectedDate(dateValue);
      setDate(moment(dateValue).format('MMMM Do YYYY'));
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Add Event</Text>

      <TouchableOpacity onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Image source={require('../../../assets/images/upload_image.jpg')} style={styles.image} />
        )}
      </TouchableOpacity>

      <TextInputField label="Event Name" onChangeText={setEventName} />
      <TextInputField label="Price"  onChangeText={setPrice} />
      <TextInputField label="Seats"  onChangeText={setSeats} />

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
        onChangeText={(text) => {
          console.log("Location changed to:", text);
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

      <TextInputField label="Details: " onChangeText={setLink} />

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

      <View style={{ marginBottom: 45 }}>
        <Button text="Submit" onPress={onSubmitBtnPress} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: Colors.WHITE,
    marginBottom: 55,
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
    marginBottom: 50,
  },
  categoryButton: {
    width: 120,
    height: 50,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: Colors.PRIMARY,
  },
  selectedCategoryButton: {
    backgroundColor: Colors.SECONDARY,
  },
  categoryText: {
    color: Colors.WHITE,
    fontSize: 14,
  },
  selectedCategoryText: {
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
  mapLoader: {
    marginBottom: 20,
  },
  mapImage: {
    width: '100%',
    height: 200,
    marginTop: 20,
    borderRadius: 10,
  },
  datetimeContainer: {
    marginBottom: 20,
  },
});
