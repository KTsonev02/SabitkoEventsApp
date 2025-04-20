import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import React, { useContext, useState } from 'react';
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
  const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
  const formattedTime = moment(selectedTime).format('HH:mm');
  const router = useRouter();

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

 
  const onSubmitBtnPress = async () => {
    if (!eventName || !location || !link || !selectedDate || !selectedTime || !image) {
      Alert.alert('Missing Info', 'Please fill all fields and upload image');
      return;
    }
  
    try {
      // Качи снимката в Cloudinary
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
            const result = await axios.post(`${process.env.EXPO_PUBLIC_HOST_URL}/events`, {
                eventName: eventName,
                bannerUrl: resp.url,
                location: location,
                link: link,
                eventDate: formattedDate,
                eventTime: formattedTime,
                email:user?.email
            });
  
            console.log('Event Added:', result.data);
  
            Alert.alert('Great!', 'New Event added', [
              {
                text: 'OK',
                onPress: () => {
                  router.replace('/Event');
                },
              },
            ]);
          } catch (postError: any) {
            console.error('API Post Error:', postError.response?.data || postError.message);
            Alert.alert('Error', 'Something went wrong while saving event.');
          }
        },
      });
    } catch (err) {
      console.error('Unexpected Error:', err);
      Alert.alert('Error', 'Unexpected error occurred.');
    }
  };
  

  const onTimeChange = (event: any, timeValue: Date | undefined) => {
    setOpenTimePicker(false);
    if (timeValue) {
      setSelectedTime(timeValue); // Записване в ISO формат
      setTime(moment(timeValue).format('h:mm A')); // Показване в човешки формат
    }
  };
  
  const onDateChange = (event: any, dateValue: Date | undefined) => {
    setOpenDatePicker(false);
    if (dateValue) {
      setSelectedDate(dateValue); // Задаваш обект от тип Date
      setDate(moment(dateValue).format('MMMM Do YYYY')); // Показваш формат в човешки вид
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

      <TextInputField label="Event Name" onChangeText={(v) => setEventName(v)} />
      <TextInputField label="Location" onChangeText={(v) => setLocation(v)} />
      <TextInputField label="Link For Event Details" onChangeText={(v) => setLink(v)} />

      <View>
        <Button text={date} outline={true} onPress={() => setOpenDatePicker(true)} />
        <Button text={time} outline={true} onPress={() => setOpenTimePicker(true)} />
      </View>

      {openDatePicker && (
        <RNDateTimePicker mode="date" value={selectedDate || new Date()} onChange={onDateChange} />
      )}

      {openTimePicker && (
        <RNDateTimePicker mode="time" value={selectedTime || new Date()} onChange={onTimeChange} />
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
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
  },
});
