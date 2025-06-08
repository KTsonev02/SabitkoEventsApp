import { View, Text, FlatList, RefreshControl } from 'react-native'
import React, { useState, useCallback, useEffect, useContext } from 'react'
import Header from '@/components/Home/Header'
import EventSlider from '@/components/Home/EventSlider'
import LatestPost from '@/components/Home/LatestPost'
import LatestEvents from '@/components/Home/LatestEvents'
import NotificationsList from '@/components/NotificationsList'
import { AuthContext } from '@/context/AuthContext'

export default function Home() {
  const [refreshing, setRefreshing] = useState(false)
  const { user } = useContext(AuthContext)
  const [notifications, setNotifications] = useState<any[]>([])

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_HOST_URL}/notifications?userId=${user.id}`)
      const data = await response.json()
      setNotifications(data)
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    }
  }, [user])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      // Презареждаме всички данни, включително нотификациите
      await Promise.all([
        fetchNotifications(),
        // Тук можете да добавите и други fetch заявки за EventSlider, LatestEvents и т.н.
      ])
    } finally {
      setRefreshing(false)
    }
  }, [fetchNotifications])

  return (
    <FlatList
      data={[]}
      renderItem={null}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
      ListHeaderComponent={
        <View style={{ padding: 20, paddingTop: 40 }}>
          <Header />
          <NotificationsList 
            notifications={notifications}
            onRefresh={fetchNotifications}
          />
          <View>
            <EventSlider />
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}></Text>
            <LatestEvents />
          </View>
          <View style={{ marginTop: 30, paddingHorizontal: 10 }}>
            <LatestPost />
          </View>
        </View>
      }
    />
  )
}