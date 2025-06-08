import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';

interface Notification {
  id: number;
  message: string;
  created_at: string;
}

interface NotificationsListProps {
  notifications: Notification[];
  onRefresh?: () => void;
}

export default function NotificationsList({ notifications, onRefresh }: NotificationsListProps) {
  const [showList, setShowList] = useState(false);

  const toggleList = () => setShowList(!showList);

  const handleDelete = async (id: number) => {
    try {
      await fetch(`${process.env.EXPO_PUBLIC_HOST_URL}/notifications?id=${id}`, {
        method: "DELETE",
      });
      // Извикваме onRefresh, за да обновим списъка след изтриване
      onRefresh && onRefresh();
    } catch (error) {
      Alert.alert("Error", "Failed to delete notification.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleList} style={styles.bellIcon}>
        <MaterialIcons 
          name="notifications" 
          size={30} 
          color={notifications.length > 0 ? "red" : "gray"} 
        />
      </TouchableOpacity>

      {showList && (
        notifications.length === 0 ? (
          <Text style={styles.noNotifications}>No new notifications</Text>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.notificationItem}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
              </TouchableOpacity>
            )}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  bellIcon: { alignSelf: "flex-end", marginBottom: 10 },
  notificationItem: { marginBottom: 15, padding: 10, backgroundColor: "#eee", borderRadius: 5 },
  message: { fontSize: 16 },
  date: { fontSize: 12, color: "#666", marginTop: 5 },
  noNotifications: { fontSize: 18, textAlign: "center", marginTop: 50, color: "#999" },
});