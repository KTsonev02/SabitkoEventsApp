import { useContext, useEffect, useState } from "react";
import { 
  Text, View, FlatList, TouchableOpacity, 
  ActivityIndicator, Alert, StyleSheet 
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Button from "@/components/Shared/Button";
import { AuthContext } from "@/context/AuthContext";
import Tickets from "@/app/(tabs)/Tickets";

export default function BuyTicketsScreen() {
  const { id } = useLocalSearchParams();    // id на събитието
  const router = useRouter();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<any[]>([]);
  const { user } = useContext(AuthContext);
  useEffect(() => {
    if (id) fetchEvent(id as string);
  }, [id]);

  const fetchEvent = async (eventId: string) => {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_HOST_URL}/events?id=${eventId}`);
      const data = await res.json();
      setEvent(data);
    } catch (error) {
      console.error("❌ Error loading event:", error);
      Alert.alert("Грешка", "Неуспешно зареждане на събитието.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (seat: any) => {
    if (seat.user_id) return; // ако е заето
    setSelectedSeats(prev => {
      const idx = prev.findIndex(s => s.id === seat.id);
      if (idx >= 0) {
        // премахваме
        return prev.filter(s => s.id !== seat.id);
      } else {
        // добавяме
        return [...prev, seat];
      }
    });
  };

  const buySeats = async () => {
    if (selectedSeats.length === 0) {
      Alert.alert("Изберете място", "Моля, изберете поне едно свободно място!");
      return;
    }

    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_HOST_URL}/events?id=${event.id}&action=buy`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id, // <-- трябва да предадеш ID на потребителя, който купува
          seatIds: selectedSeats.map(s => s.id)
        }),
      });
      if (!res.ok) throw new Error();
      Alert.alert("Успех", `Успешно резервирахте ${selectedSeats.length} места!`);
      router.push("/Tickets");
    } catch {
      Alert.alert("Грешка", "Неуспешна резервация.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  if (!event) {
    return (
      <View style={styles.center}>
        <Text>Събитието не е намерено.</Text>
      </View>
    );
  }

  // Пресмятаме общата цена
  const totalPrice = selectedSeats.length * parseFloat(event.price);

  return (
    <View style={styles.container}>
      {/* Детайли за събитието */}
      <Text style={styles.title}>{event.name}</Text>
      <Text style={styles.subtitle}>
        {event.event_date} • {event.event_time}
      </Text>
      <Text style={styles.subtitle}>{event.location}</Text>
      <Text style={styles.price}>Цена на билет: {event.price} лв.</Text>

      {/* Списък със седалките */}
      <FlatList
        data={event.seats.sort((a: any, b: any) => {
          // сортиране по ред и номер
          const rowA = a.seat_number.replace(/[0-9]/g, "");
          const rowB = b.seat_number.replace(/[0-9]/g, "");
          if (rowA !== rowB) return rowA < rowB ? -1 : 1;
          const numA = parseInt(a.seat_number.replace(/\D/g, ""));
          const numB = parseInt(b.seat_number.replace(/\D/g, ""));
          return numA - numB;
        })}
        numColumns={6}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const isSelected = selectedSeats.some(s => s.id === item.id);
          const isOccupied = item.user_id !== null;
          return (
            <TouchableOpacity
              onPress={() => toggleSeat(item)}
              disabled={isOccupied}
              style={[
                styles.seat,
                isOccupied ? styles.occupied : isSelected ? styles.selected : styles.free
              ]}
            >
              <Text style={styles.seatText}>{item.seat_number}</Text>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.seatsContainer}
      />

      {/* Обща цена и бутон купи */}
      <View style={styles.footer}>
        <Text style={styles.total}>Обща цена: {totalPrice.toFixed(2)} лв.</Text>
        <View style={{ width: 200, height: 150 }}>
          <Button
            text={`Купи ${selectedSeats.length} билети`}
            onPress={buySeats}
            // disabled={selectedSeats.length === 0}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, marginBottom: 100 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold" },
  subtitle: { fontSize: 16, marginVertical: 4 },
  price: { fontSize: 18, fontWeight: "600", marginVertical: 8 },
  seatsContainer: { alignItems: "center" },
  seat: {
    margin: 4,
    width: 50,
    height: 50,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center"
  },
  free: { backgroundColor: "green" },
  occupied: { backgroundColor: "red" },
  selected: { backgroundColor: "blue" },
  seatText: { color: "white", fontWeight: "bold" },
  footer: {
    // width: '90%',
    // height: '20%',
    margin: 20,
    position: 'relative',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  }, 
  total: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
  }, 
  
});
