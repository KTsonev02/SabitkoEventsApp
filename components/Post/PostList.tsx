import { View, FlatList, Alert } from 'react-native';
import React from 'react';
import PostCard from './PostCard';
import axios from 'axios';

export default function PostList({ posts, OnRefresh, loading, onEndReached, ListFooterComponent }: any) {
  const handleDeletePost = async (postId: number) => {
      Alert.alert(
        "Потвърждение",
        "Сигурни ли сте, че искате да изтриете този пост?",
        [
          { text: "Отказ", style: "cancel" },
          {
            text: "Изтрий",
            onPress: async () => {
              try {
                const response = await axios.delete(
                  `${process.env.EXPO_PUBLIC_HOST_URL}/post?id=${postId}`,
                  {
                    data: { postId },
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  }
                );

                if (response.status === 200) {
                  Alert.alert("Успех", "Постът е изтрит");
                  OnRefresh();
                }
              } catch (error) {
                console.error('API грешка:', error);
                Alert.alert(
                  "Грешка",
                );
              }
            },
          },
        ]
      );

  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={posts}
        onRefresh={OnRefresh}
        refreshing={loading}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard post={item} onDelete={handleDeletePost} />
        )}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListFooterComponent={ListFooterComponent}
      />
    </View>
  );
}