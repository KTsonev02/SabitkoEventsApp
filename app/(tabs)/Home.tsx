import { View, Text, FlatList } from 'react-native'
import React from 'react'
import Header from '@/components/Home/Header'
import Category from '@/components/Home/Category'
import LatestPost from '@/components/Home/LatestPost'

export default function Home() {
  return (
    <FlatList
    data={[]}
    renderItem={null}
    ListHeaderComponent={
    <View style={{
      padding: 20,
      paddingTop: 40,
    }}>
      <Header />

      <Category />

      <LatestPost />
    </View>
    } />
  )
}