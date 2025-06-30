import React, { useState, useEffect } from "react";
import { Platform, Alert } from "react-native";

import * as Notifications from "expo-notifications";

import { AuthContext } from "@/context/AuthContext";
import { Stack } from "expo-router";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface USER {
  id: number;
  name: string;
  email: string;
  image: string;
    username: string;
  role: 'admin' | 'organizer' | 'user'; 
}

// Конфигуриране как се показват уведомления в foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false, 
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    Alert.alert("Нотификации", "Не са разрешени нотификации.");
    return;
  }

  token = (await Notifications.getExpoPushTokenAsync()).data;

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}

async function savePushToken(userId: number, token: string, deviceNotifications: boolean) {
  try {
    console.log("Sending token:", token, "for user:", userId);
    const res = await fetch(`${process.env.EXPO_PUBLIC_HOST_URL}/push-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, token, device_notifications: deviceNotifications }),
    });
    if (!res.ok) throw new Error("Failed to save push token");
    const data = await res.json();
    console.log("Push token saved:", data.message);
  } catch (error) {

  }
}

export default function RootLayout() {
  const [user, setUser] = useState<USER | undefined>(undefined);

  useEffect(() => {
    if (!user) return;

    (async () => {
      const token = await registerForPushNotificationsAsync();
      if (!token) return;

      const deviceNotificationsEnabled = true;
      await savePushToken(user.id, token, deviceNotificationsEnabled);
    })();
  }, [user]);

  // Слушател за push нотификации когато приложението е активно (foreground)
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(async (notification) => {
      const { title, body, data } = notification.request.content;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: title ?? "Нова нотификация",
          body: body ?? "",
          sound: "default",
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: [0, 250, 250, 250],
          data: data ?? {},
        },
        trigger: null,
      });
    });

    return () => subscription.remove();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Elements stripe={stripePromise}>
        <Stack>
          <Stack.Screen name="landing" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/SignUp" options={{ headerTransparent: true, headerTitle: "" }} />
          <Stack.Screen name="(auth)/SignIn" options={{ headerTransparent: true, headerTitle: "" }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="add-post/index" options={{ headerTitle: "Add New Post" }} />
          <Stack.Screen name="(api)/edit-event/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="(api)/buy-tickets/[id]" options={{ headerTitle: "Book an event:" }} />
          <Stack.Screen name="(api)/event/[id]" options={{ headerTitle: "Detail for:" }} />
          <Stack.Screen name="(api)/add-event/index" options={{ headerTitle: "Add New Event" }} />
        </Stack>
      </Elements>
    </AuthContext.Provider>
  );
}
