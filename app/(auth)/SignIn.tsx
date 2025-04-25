import { View, Text, Image, Pressable, ToastAndroid } from 'react-native'
import React, { useContext, useState } from 'react'
import TextInputField from '@/components/Shared/TextInputField'
import Button from '@/components/Shared/Button'
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/configs/FirebaseConfig';
import axios from 'axios';
import { AuthContext } from '@/context/AuthContext';

export default function SignIn() {


  const router = useRouter();
  const[email, setEmail]=useState<string | undefined>();
  const[password, setPassword]=useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const {user, setUser}=useContext(AuthContext);
  const onSignInBtnClick = () => {
    if (!email || !password) {
      ToastAndroid.show('Please enter email and password', ToastAndroid.SHORT);
      return;
    }

    // Премахваме всички интервали в началото и края на email
    const trimmedEmail = email.trim();

    setLoading(true);
    signInWithEmailAndPassword(auth, trimmedEmail, password)
      .then(async (resp) => {
        if (resp.user) {
          console.log("User logged in:", resp.user?.email);
          // API call to fetch user Data
          try {
            console.log("API URL: ", process.env.EXPO_PUBLIC_HOST_URL + "/user?email=" + resp.user?.email);
            const result = await axios.get(
              process.env.EXPO_PUBLIC_HOST_URL + "/user?email=" + resp.user?.email
            );
            console.log("User data:", result.data);
            setUser(result?.data);
            router.replace('/(tabs)/Home');
          } catch (error) {
            console.error("Error fetching user data:", error);
            ToastAndroid.show('Error fetching user data', ToastAndroid.SHORT);
          }
        }
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
        console.error("Sign-in error:", e);
        ToastAndroid.show('Incorrect email or password', ToastAndroid.SHORT);
      });
  };

  return (
    <View style = {{
      flex: 1,
      padding: 20,
      paddingTop: 50,
      backgroundColor: 'white',
    }
      
    }>
      <View style = {{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,

      }}>
        <Image source={require('./../../assets/images/logo.png')}
        style = {{width: 250, height: 250,}}/>
        <Text style = {{
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 20,
        color: 'black',
      }}>Sign In To Sabitko</Text>

      </View >
      <TextInputField label='Email' onChangeText={(v) => setEmail(v)}/>
      <TextInputField label='Password' password={true} onChangeText={(v) => setPassword(v)}/>

        <Button text = 'Sign In' onPress={() => onSignInBtnClick()}
          loading={loading} />
        <Pressable onPress={() => router.push('/(auth)/SignUp')}>
          <Text style={{ color: 'black', fontSize: 15, textAlign: 'center', marginTop: 20
          }}>New to Sabitko? Create New Accout Here</Text>
        </Pressable>
    </View>
  )
}