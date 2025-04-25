import { View, Text, FlatList } from 'react-native'
import React from 'react'
import Header from '@/components/Home/Header'
import EventSlider from '@/components/Home/EventSlider'
import LatestPost from '@/components/Home/LatestPost'
import LatestEvents from '@/components/Home/LatestEvents'

export default function Home() {
  return (
    <FlatList
      data={[]}
      renderItem={null}
      ListHeaderComponent={
        <View style={{ padding: 20, paddingTop: 40 }}>
          <Header />

          {/* Категория заменена със Slider + Upcoming */}
          <View>
            <EventSlider />
            
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}></Text>
            <LatestEvents />
          </View>

          {/* Latest posts с подобрен стил */}
          <View style={{ marginTop: 30, paddingHorizontal: 10 }}>
            <LatestPost />
          </View>
        </View>
      }
    />
  )
}
