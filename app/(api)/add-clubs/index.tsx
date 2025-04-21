import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, ToastAndroid, ScrollView } from 'react-native';
import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { upload } from 'cloudinary-react-native';
import { cld, options } from '@/configs/CloudinaryConfig';
import axios from 'axios';
import { useRouter } from 'expo-router';
import Button from '@/components/Shared/Button';

export default function CreateClub() {
  const [clubName, setClubName] = useState('');
  const [about, setAbout] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const route = useRouter();

  const onCreateClubClick = async () => {
    // Проверяваме дали всички полета са попълнени
    if (!clubName || !about) {
      ToastAndroid.show('Please fill all fields', ToastAndroid.SHORT);
      return;
    }
  
    setLoading(true);
  
    try {
      // Стъпка за качване на изображението в Cloudinary
      let uploadImageUrl = null;
      if (selectedImage) {
        const resultData: any = await new Promise(async (resolve, reject) => {
          await upload(cld, {
            file: selectedImage,
            options: options,
            callback: (error: any, response: any) => {
              if (error) reject(error);
              else resolve(response);
            },
          });
        });
        uploadImageUrl = resultData?.url || null;
        console.log("📸 Изображение качено: ", uploadImageUrl);  // Лог на URL-то на изображението
      }
  
      const fullUrl = `${process.env.EXPO_PUBLIC_HOST_URL}/clubs`;  // Добави тук реалния URL
      console.log("📡 Изпращам заявка към:", fullUrl);  // Лог на пътя на заявката
  
      // Изпращаме данните на сървъра
      const response = await axios.post(fullUrl, {
        clubName,
        imageUrl: uploadImageUrl,
        about,
      });
  
      console.log("API отговор:", response.data);  // Лог на отговора от сървъра
  
    } finally {
      setLoading(false);
      route.replace('/(api)/explore-clubs');

    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.5,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        placeholder='Club Name'
        style={styles.textInput}
        value={clubName}
        onChangeText={setClubName}
      />

      <TextInput
        placeholder='About the Club'
        style={styles.textInput}
        value={about}
        onChangeText={setAbout}
        multiline
        numberOfLines={5}
      />

      <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.image} />
        ) : (
          <Image
            source={require('../../../assets/images/upload_image.jpg')}
            style={styles.image}
          />
        )}
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <Button text='Create Club' onPress={onCreateClubClick} loading={loading} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  textInput: {
    backgroundColor: 'white',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingLeft: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  imageContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonContainer: {
    marginTop: 10,
  },
});
