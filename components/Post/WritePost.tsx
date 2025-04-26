import { View, TextInput, StyleSheet, Image, TouchableOpacity, ToastAndroid, ScrollView } from 'react-native'
import React, { useContext, useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { cld, options } from '@/configs/CloudinaryConfig'
import { upload } from 'cloudinary-react-native'
import { AuthContext } from '@/context/AuthContext'
import axios from 'axios'
import Button from '../Shared/Button'
import { useRouter } from 'expo-router'

export default function WritePost() {
    const [content, setContent] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined)
    const { user } = useContext(AuthContext)
    const [loading, setLoading] = useState(false)
    const route = useRouter()

    const onPostBtnClick = async () => {
        if (!content) {
            ToastAndroid.show('Please enter content', ToastAndroid.SHORT)
            return
        }

        setLoading(true)

        try {
            let uploadImageUrl = ''
            if (selectedImage) {
                const resultData: any = await new Promise(async (resolve, reject) => {
                    await upload(cld, {
                        file: selectedImage,
                        options: options,
                        callback: (error: any, response: any) => {
                            if (error) reject(error)
                            else resolve(response)
                        }
                    })
                })
                uploadImageUrl = resultData?.url || ''
            }

            await axios.post(`${process.env.EXPO_PUBLIC_HOST_URL}/post`, {
                content: content,
                imageUrl: uploadImageUrl, // ако няма изображение, URL ще е празно
                visibleIn: 0, // винаги Public
                email: user?.email
            })

            route.replace('/(tabs)/Home')
        } catch (error) {
            console.error("Post creation failed:", error)
            ToastAndroid.show('Failed to create post', ToastAndroid.SHORT)
        } finally {
            setLoading(false)
        }
    }

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 4],
            quality: 0.5,
        })

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri)
        }
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TextInput
                placeholder='Write your post here...'
                style={styles.textInput}
                multiline={true}
                numberOfLines={5}
                maxLength={1000}
                onChangeText={setContent}
            />

            <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                {selectedImage ?
                    <Image source={{ uri: selectedImage }} style={styles.image} /> :
                    <Image
                        source={require('../../assets/images/upload_image.jpg')}
                        style={[styles.image, styles.placeholderImage]} // Добавено място за по-голям placeholder
                    />
                }
            </TouchableOpacity>

            <View style={styles.buttonContainer}>
                <Button
                    text='Add Post'
                    onPress={onPostBtnClick}
                    loading={loading}
                />
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        paddingBottom: 40,
    },
    textInput: {
        backgroundColor: 'white',
        height: 150,
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 15,
        borderRadius: 10,
        textAlignVertical: 'top',
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
    placeholderImage: {
        width: 180, // Увеличаваме placeholder-а, за да изглежда по-добре
        height: 180,
    },
    buttonContainer: {
        marginTop: 10,
    }
})
