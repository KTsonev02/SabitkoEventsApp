import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useContext, useState } from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { likePost, unlikePost } from './LikePost'; // Вашите API функции за лайковете
import { AuthContext } from '@/context/AuthContext';

interface PostCardProps {
  post: {
    id: number;
    content: string;
    username: string;
    userprofileimage: string;
    imageurl: string;
    createdon: string;
    likes_count: number;
  };
  onDelete: (postId: number) => void;
}

export default function PostCard({ post, onDelete }: PostCardProps) {
  const [likes, setLikes] = useState(post.likes_count);
  const { user } = useContext(AuthContext);

  const handleLike = async () => {
    try {
      if (!user?.email) {
        throw new Error("You must be logged in to like posts");
      }
      await likePost(post.id, user.email);
      setLikes(likes + 1);
    } catch (error) {
      console.error("Error liking post:");
      // Optionally show error to user
    }
  };

  const handleUnlike = async () => {
    try {
      if (!user?.email) {
        throw new Error("You must be logged in to unlike posts");
      }
      await unlikePost(post.id, user.email);
      setLikes(likes - 1);
    } catch (error) {
      console.error("Error unliking post:");
      // Optionally show error to user
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.username}>{post.username}</Text>
      <Text style={styles.content}>{post.content}</Text>

      {post.imageurl && (
        <Image
          source={{ uri: post.imageurl }}
          style={styles.image}
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleLike} style={styles.likeButton}>
          <AntDesign name="like1" size={24} color="white" />
          <Text style={styles.buttonText}>Like</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleUnlike} style={styles.unlikeButton}>
          <AntDesign name="dislike1" size={24} color="white" />
          <Text style={styles.buttonText}>Unlike</Text>
        </TouchableOpacity>

        <Text style={styles.likes}>{likes}</Text>

        <FontAwesome5 name="comment" size={24} color="black" />
        <Text style={styles.commentCount}>25</Text>
      </View>

      <TouchableOpacity onPress={() => onDelete(post.id)} style={styles.deleteButton}>
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    marginVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 10,
  },
  likeButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  unlikeButton: {
    backgroundColor: '#f44336',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 16,
  },
  likes: {
    fontSize: 18,
    marginLeft: 8,
  },
  commentCount: {
    fontSize: 18,
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#ff4d4d',
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    alignItems: 'center',
  },
  deleteText: {
    color: 'white',
    fontSize: 16,
  },
});
