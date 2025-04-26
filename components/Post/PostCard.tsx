import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useContext } from 'react';
import UserAvatar from './UserAvatar';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { AuthContext } from '@/context/AuthContext';

interface PostCardProps {
  post: {
    id: number;
    content: string;
    username: string;
    userprofileimage: string;
    imageurl: string;
    createdon: string;
  };
  
  onDelete: (postId: number) => void; // Pass the onDelete function as a prop
}

export default function PostCard({ post, onDelete }: PostCardProps) {
    
  return (
    <View style={{
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 15,
        backgroundColor: Colors.WHITE,
        borderRadius: 10,
        marginTop: 10
    }}>
        <UserAvatar name={post?.username} image={post?.userprofileimage} date={post?.createdon} />
        
        
        <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            marginTop: 8,
            color: '#333',
            marginBottom: 10,
        }}>
            
            {post.content}
        </Text>

        {post.imageurl &&
            <Image 
                source={{uri: post?.imageurl}} 
                style={{
                    width: '100%',
                    height: 180,
                    borderRadius: 12,
                    backgroundColor: '#e0e0e0', 
                    borderColor: '#ccc',
                    borderWidth: 1,
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

        {/* Delete Button */}
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => onDelete(post.id)} // Call the onDelete function with the post ID
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    subContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    deleteButton: {
        marginTop: 15,
        padding: 10,
        backgroundColor: '#ff4d4d',
        borderRadius: 5,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: 'white',
        fontSize: 16,
    }
});
