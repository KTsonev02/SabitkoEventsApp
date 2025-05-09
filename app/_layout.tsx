import { AuthContext } from "@/context/AuthContext";
import { Stack } from "expo-router";
import { useState } from "react";
import { Platform } from "react-native";

// Импортираме Elements за уеб
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface USER {
  id: number;
  name: string;
  email: string;
  image: string;
}

export default function RootLayout() {
  const [user, setUser] = useState<USER | undefined>(undefined);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {/* Обвиваме с Elements за всички платформи */}
      <Elements stripe={stripePromise}>
        <Stack>
          <Stack.Screen name="landing" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/SignUp" options={{ headerTransparent: true, headerTitle: '' }} />
          <Stack.Screen name="(auth)/SignIn" options={{ headerTransparent: true, headerTitle: '' }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="add-post/index" options={{ headerTitle: "Add New Post" }} />
          <Stack.Screen name="(api)/edit-event/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="(api)/buy-tickets/[id]" options={{ headerTitle: "Book an event:" }} />
          <Stack.Screen name="event/[id]" options={{ headerTitle: "Detail for:" }} />
          <Stack.Screen name="(api)/add-event/index" options={{ headerTitle: "Add New Event" }} />
        </Stack>
      </Elements>
    </AuthContext.Provider>
  );
}
