import { View, Text, Image, StyleSheet } from 'react-native';
import React, { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

export default function Header() {
    const { user } = useContext(AuthContext);
    
    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image 
                    source={require('../../assets/images/logo.png')} // Локално лого
                    style={styles.logo}
                />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.greeting}>Hello, {user?.name}!</Text>
                <Text style={styles.appName}>Explore Events!</Text>
            </View>
            <View style={styles.profileContainer}>
                <Image 
                    source={{ uri: user?.image }} 
                    style={styles.profileImage}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: '#f5f6fa',
        alignItems: 'center',
    },
    logoContainer: {
        
    },
    logo: {
        width: 100, // Увеличаване на логото
        height: 100,
        resizeMode: 'contain',
    },
    textContainer: {
        flex: 1, // Това ще позволи на текста да заема цялото пространство между логото и профилната снимка
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    appName: {
        fontSize: 18,
        color: '#636e72',
    },
    profileContainer: {
        alignItems: 'center',
    },
    profileImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 3,
        borderColor: '#ecf0f1',
    },
});
