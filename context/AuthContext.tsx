import { createContext, useContext, useState, useEffect } from "react";
import { Platform, Alert } from "react-native";
import * as Notifications from "expo-notifications";

interface User {
  id: number;
  name: string;
  email: string;
  image: string;
  username: string; 
  role: 'admin' | 'organizer' | 'user'; 
}

interface AuthContextType {
  user: User | undefined;
  setUser: (user: User | undefined) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: undefined,
  setUser: () => {},
});

// Хук за регистрация на push нотификации
async function registerForPushNotifications(userId: number) {
  if (Platform.OS === 'web') return;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert(
      "Разрешение изисквано",
      "Моля, разрешете push нотификациите, за да получавате обновления."
    );
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log("Expo push token получен:", token);

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // Запазване на токена в базата данни
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/api/push-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          token,
          device_notifications: true,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Грешка при запазване на token');
    }

    console.log('Token запазен успешно');
  } catch (error) {
    console.error('Грешка при запазване на push token:', error);
  }
}

// Provider компонент
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    if (!user?.id) return;

    // Регистриране на push нотификации при промяна на user
    registerForPushNotifications(user.id);

    // Слушател за нотификации
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Нотификация получена:', notification);
      }
    );

    return () => {
      subscription.remove();
    };
  }, [user?.id]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Хук за лесен достъп до контекста
export function useAuth() {
  return useContext(AuthContext);
}