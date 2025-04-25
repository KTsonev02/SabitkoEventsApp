import { AuthContext } from "@/context/AuthContext";
import { Stack } from "expo-router";
import { useState } from "react";

interface USER {
  id: number,
  name: string,
  email: string,
  image: string,
}

export default function RootLayout() {
  const [user, setUser] = useState<USER | undefined>(undefined);
  return (
    <AuthContext.Provider value={{user, setUser}}>
    <Stack>
      <Stack.Screen name = 'landing' 
        options={{
        headerShown: false,
      }}
      />

      <Stack.Screen name = "(auth)/SignUp"
        options={{
          headerTransparent: true,
          headerTitle: ''
        }}
        />
        <Stack.Screen name = "(auth)/SignIn"
        options={{
          headerTransparent: true,
          headerTitle: ''
        }}
        />
        <Stack.Screen name = "(tabs)"
        options={{
          headerShown: false
        }}
        />
        <Stack.Screen name = "add-post/index"
        options={{
          headerTitle: "Add New Post"
        }}
        />
          <Stack.Screen name = "(api)/explore-clubs/index"
        options={{
          headerTitle: "Explore Club",
          // headerTransparent: true
        }}
        />
        <Stack.Screen name = "event/[id]"
        options={{
          headerTitle: "Detail for:",
                }}
        />
         <Stack.Screen name = "(api)/add-event/index"
        options={{
          headerTitle: "Add New Event"
        }}
        />
        </Stack>

        </AuthContext.Provider>
  )
}
