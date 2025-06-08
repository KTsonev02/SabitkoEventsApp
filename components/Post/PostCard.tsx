import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useContext, useState, useEffect } from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import { likePost, unlikePost } from './LikePost';
import { AuthContext } from '@/context/AuthContext';
import PostComments from './PostComments';
import UserAvatar from './UserAvatar';

interface PostCardProps {
  post: {
    id: number;
    content: string;
    username: string;
    userprofileimage: string;
    email: string;
    useremail: string;  // имейл на създателя
    imageurl: string;
    createdon: string;
    likes_count: number;
    comment_count: number;
  };
  onDelete: (postId: number) => void;
}

export default function PostCard({ post, onDelete }: PostCardProps) {
  const [likes, setLikes] = useState(post.likes_count);
  const [isLiked, setIsLiked] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user?.email) return;

    // fetch дали текущият user е лайкнал поста
    fetch(`/api/check-like?postId=${post.id}&userEmail=${user.email}`)
      .then(res => res.json())
      .then(data => {
        setIsLiked(data.liked); // backend връща { liked: true/false }
      })
      .catch(err => {
        console.error('Error fetching like status:', err);
      });
  }, [post.id, user?.email]);

  const handleLike = async () => {
    try {
      if (!user?.email) {
        throw new Error("You must be logged in to like posts");
      }
      await likePost(post.id, user.email);
      setLikes(likes + 1);
      setIsLiked(true);
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleUnlike = async () => {
    try {
      if (!user?.email) {
        throw new Error("You must be logged in to unlike posts");
      }
      await unlikePost(post.id, user.email);
      setLikes(likes - 1);
      setIsLiked(false);
    } catch (error) {
      console.error("Error unliking post:", error);
    }
  };

  const canDelete = user?.email === post.useremail || user?.role === 'admin'; 

  return (
    <View style={styles.container}>
      <UserAvatar name={post?.username} image={post?.userprofileimage} date={post?.createdon} />
      <Text style={styles.username}>{post.username}</Text>
      <Text style={styles.content}>{post.content}</Text>

      {post.imageurl && (
        <Image
          source={{ uri: post.imageurl }}
          style={styles.image}
        />
      )}

      <View style={styles.footer}>
        {isLiked ? (
          <TouchableOpacity onPress={handleUnlike} style={styles.unlikeButton}>
            <AntDesign name="dislike1" size={24} color="white" />
            <Text style={styles.buttonText}>Unlike</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleLike} style={styles.likeButton}>
            <AntDesign name="like1" size={24} color="white" />
            <Text style={styles.buttonText}>Like</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.likes}>Rate: {likes}</Text> 
      </View>

      <PostComments 
        postId={post.id}
        userId={String(user?.id || '')}
        currentUserUsername={user?.username || ''}
        initialCommentCount={post.comment_count}
      />

      {canDelete && (
        <TouchableOpacity onPress={() => onDelete(post.id)} style={styles.deleteButton}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      )}
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
