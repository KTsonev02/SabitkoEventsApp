import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import Colors from '../constants/Colors';
import axios from 'axios';
import PostList from '@/components/Post/PostList';
import { Ionicons } from '@expo/vector-icons'; // Импортирайте иконата
import { router } from 'expo-router'; // Импортирайте router за навигация

export default function AllPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllPosts();
  }, []);

  const fetchAllPosts = async () => {
    try {
      setLoading(true);
      const result = await axios.get(process.env.EXPO_PUBLIC_HOST_URL + '/post?club=0&orderField=post.id');
      console.log('Получени постове:', result.data);
      setPosts(result.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Добавете бутона "+" в горния десен ъгъл */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => router.push('/add-post')}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Заглавие и подзаглавие */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>🌟 Всички постове</Text>
        <Text style={styles.subtitle}>Открий най-новото от света на събитията</Text>
        <View style={styles.divider} />
      </View>

      {/* Постове или индикатор за зареждане */}
      {loading ? (
        <ActivityIndicator size="large" color={Colors.PRIMARY} style={{ marginTop: 30 }} />
      ) : (
        <PostList 
          posts={posts}
          loading={loading}
          OnRefresh={fetchAllPosts}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa', 
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerContainer: {
    marginBottom: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b6b6b',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  divider: {
    height: 2,
    backgroundColor: Colors.PRIMARY,
    width: '40%',
    borderRadius: 99,
    marginBottom: 10,
  },
  // Добавете стил за бутона
  addButton: {
    position: 'absolute',
    marginTop: 20,
    right: 20,
    top: 20,
    backgroundColor: Colors.PRIMARY,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // Уверете се, че бутона е над другите елементи
  },
});