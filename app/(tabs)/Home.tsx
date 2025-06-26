import { View, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import React, { useState, useCallback, useEffect, useContext, Suspense, lazy } from 'react';
import Header from '@/components/Home/Header';
import NotificationsList from '@/components/NotificationsList';
import { AuthContext } from '@/context/AuthContext';

// 👉 Lazy компоненти
const EventSlider = lazy(() => import('@/components/Home/EventSlider'));
const LatestEvents = lazy(() => import('@/components/Home/LatestEvents'));
const LatestPost = lazy(() => import('@/components/Home/LatestPost'));

export default function Home() {
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_HOST_URL}/notifications?userId=${user.id}`);
      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchNotifications(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [fetchNotifications]);

  return (
    <FlatList
      data={[]}
      renderItem={null}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <View style={{ padding: 20, paddingTop: 40 }}>
          <Header />
          <NotificationsList notifications={notifications} onRefresh={fetchNotifications} />

          {/* 👉 Lazy зареждане на тежките секции */}
          <Suspense fallback={<ActivityIndicator size="large" color="#3498db" />}>
            <EventSlider />
            <LatestEvents />
            <LatestPost />
          </Suspense>
        </View>
      }
    />
  );
}
