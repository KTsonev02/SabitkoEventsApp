import { View, Text, Image, TouchableOpacity, ToastAndroid } from 'react-native';
import { Checkbox } from 'react-native-paper';
import React, { useContext, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import TextInputField from '@/components/Shared/TextInputField';
import Button from '@/components/Shared/Button';
import * as ImagePicker from 'expo-image-picker';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/configs/FirebaseConfig';
import { upload } from 'cloudinary-react-native';
import axios from 'axios';
import { cld, options } from '@/configs/CloudinaryConfig';
import { useRouter } from 'expo-router';
import { AuthContext } from '@/context/AuthContext';

export default function SignUp() {
  const [profileImage, setProfileImage] = useState<string | undefined>();
  const [fullName, setFullName] = useState<string | undefined>();
  const [email, setEmail] = useState<string | undefined>();
  const [password, setPassword] = useState<string | undefined>();
  const [isOrganizer, setIsOrganizer] = useState(false); // Ново състояние за ролята
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useContext(AuthContext);

  // Функция за обработка на чекбокса
  const handleOrganizerChange = () => {
    setIsOrganizer(!isOrganizer);
  };

  const onBtnPress = () => {
    // Проверяваме дали всички полета са попълнени правилно
    if (!email || !email.includes('@') || !password || password.length < 6 || !fullName || !profileImage) {
      ToastAndroid.show('Please fill all the fields correctly', ToastAndroid.SHORT);
      return; // Спираме изпълнението на функцията, ако не са попълнени правилно всички полета
    }

    setLoading(true);

    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        console.log(userCredential);
        // Качване на профилно изображение в Cloudinary
        await upload(cld, {
          file: profileImage,
          options: options,
          callback: async (error: any, response: any) => {
            if (error) {
              console.log(error);
              setLoading(false); // Спираме зареждането, ако има грешка
              return;
            }
            if (response) {
              console.log("Cloudinary URL:", response?.url);

              try {
                // Изпращаме данни за потребителя към сървъра
                const result = await axios.post(`${process.env.EXPO_PUBLIC_HOST_URL}/user`, {
                  name: fullName,
                  email: email,
                  image: response?.url ?? '',
                  role: isOrganizer ? 'organizer' : 'user' // Добавяме роля
                });

                setUser({
                  name: fullName,
                  email: email,
                  image: response?.url ?? ''
                });

                console.log("POST result:", result.data);

                // Редирект към landing страницата
                router.push('/landing');
                setLoading(false);
              } catch (err) {
                console.error("Error posting to server:", err);
                setLoading(false);
              }
            }
          }
        });
      })
      .catch((error: any) => {
        const errorMsg = error?.message || "Something went wrong";
        ToastAndroid.show(errorMsg, ToastAndroid.SHORT);
        setLoading(false); // Спираме зареждането, ако има грешка при създаване на потребителя
      });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  return (
    <View style={{ paddingTop: 50, padding: 20, flex: 1, backgroundColor: 'white' }}>
      <Text style={{
        fontSize: 25,
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'black',
      }}>
        Create New Account
      </Text>

      <View style={{ alignItems: 'center'}}>
        <TouchableOpacity onPress={pickImage}>
          {profileImage ? (
            <Image
              source={{ uri: profileImage }}
              style={{ width: 200, height: 200, marginTop: 20, borderRadius: 100 }}
            />
          ) : (
            <Image
              source={require('./../../assets/images/profile.jpg')}
              style={{ width: 200, height: 200, marginTop: 20, borderRadius: 100 }}
            />
          )}
          <Ionicons
            name="camera"
            size={30}
            color="black"
            style={{
              position: 'absolute',
              bottom: 10,
              right: 25,
            }}
          />
        </TouchableOpacity>
      </View>
      <TextInputField label='Full Name' onChangeText={(v) => setFullName(v)} />
      <TextInputField label='Email' onChangeText={(v) => setEmail(v)} />
      <TextInputField label='Password' password={true} onChangeText={(v) => setPassword(v)} />

      {/* Чекбокс за организатор */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Checkbox
        status={isOrganizer ? 'checked' : 'unchecked'}
        onPress={handleOrganizerChange}
        />
        <Text>Register as Organizer</Text>
      </View>

      <Button text='Create Account' onPress={onBtnPress} loading={loading} />
    </View>
  );
}
