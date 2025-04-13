import { View, Text, Image, TouchableOpacity, ToastAndroid } from 'react-native'
import React, { useContext, useState } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';
import TextInputField from '@/components/Shared/TextInputField';
import Button from '@/components/Shared/Button';
import * as ImagePicker from 'expo-image-picker';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/configs/FirebaseConfig';
import {upload} from 'cloudinary-react-native'
import axios from 'axios';
import { cld, options } from '@/configs/CloudinaryConfig';
import { useRouter } from 'expo-router';
import { AuthContext } from '@/context/AuthContext';

export default function SignUp() {
  const [profileImage, setProfileImage] = useState<string | undefined>();
  const [fullName, setFullName] = useState<string | undefined>();
  const [email, setEmail] = useState<string | undefined>();
  const [password, setPassword] = useState<string | undefined>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {user, setUser} = useContext(AuthContext);

  const onBtnPress = () => {
    if (!email?.length || !password?.length || !fullName?.length || !profileImage) {
      ToastAndroid.show('Please fill all the fields', ToastAndroid.SHORT);
      return;
    }

    setLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      console.log(userCredential);
      //Upload Profile Image
      await upload(cld, {
        file: profileImage,
        options: options, 
        callback: async(error: any, response: any) => {
          if(error){
            console.log(error)
            return;
          }
          if (response) {
            console.log("Cloudinary URL:", response?.url);
  
            try {
              const result = await axios.post(`${process.env.EXPO_PUBLIC_HOST_URL}/user`, {
                name: fullName,
                email: email,
                image: response?.url??''
              })
              setUser({
                name: fullName,
                email: email,
                image: response?.url??''
              })
 
  
              console.log("Nile POST result:", result.data);
  
              // Редирект
              router.push('/landing');
              setLoading(false);

            } catch (err) {
              console.error("Error posting to Nile:", err);
              setLoading(false);
            }
          }
        }
      })
      //Save to Database

  }).catch((error: any) => {
    const errorMsg=error?.message
    ToastAndroid.show(errorMsg, ToastAndroid.SHORT);
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
    <View style={{ paddingTop: 50, padding: 20 }}>
      <Text style={{
        fontSize: 25,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000'
      }}>
        Create New Account
      </Text>

      <View style={{ alignItems: 'center' }}>
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

      <Button text='Create Account' onPress={onBtnPress} loading={loading} />
    </View>
  );
}
