import { View, Text, Image, StyleSheet } from 'react-native'
import React from 'react'
import UserAvatar from './UserAvatar'
import { Colors } from 'react-native/Libraries/NewAppScreen'
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export default function PostCard({post}: any) {
  return (
    <View style={{
        padding: 15,
        backgroundColor: Colors.WHITE,
        borderRadius: 10,
        marginTop: 10
    }}>
        <UserAvatar name={post?.name} image={post?.image} date={post?.createdon} />
        
        <Text style={{
            fontSize: 18,
            marginTop: 10,
            color: Colors.GREY
        }}>
            {post.content}
        </Text>

        {post.imageurl &&
            <Image 
                source={{uri: post?.imageurl}} 
                style={{
                    width: '100%',
                    height: 200,
                    borderRadius: 10,
                    marginTop: 10,
                }} 
            />
        }

        <View style={{
            marginTop: 10,
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
            gap: 45
        }}>
            <View style={styles.subContainer}>
                <AntDesign name="like2" size={24} color="black" />
                <Text style={{
                    fontSize: 18
                }}>25</Text>
            </View>
            <View style={styles.subContainer}>
                <FontAwesome5 name="comment" size={24} color="black" />
                <Text style={{
                    fontSize: 18
                }}>25</Text>
            </View>
        </View>
        
        <Text style={{
            marginTop: 10,
            color: Colors.GREY
        }}>
            View All Comment
        </Text>
    </View>
  );
}

const styles = StyleSheet.create({
    subContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
});
