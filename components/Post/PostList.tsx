import { View, Text, FlatList } from 'react-native'
import React from 'react'
import PostCard from './PostCard'

export default function PostList({ posts, OnRefresh, loading, onEndReached, ListFooterComponent }: any) {
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={posts}
        onRefresh={OnRefresh}
        refreshing={loading}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => <PostCard post={item} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListFooterComponent={ListFooterComponent}
      />
    </View>
  );
}