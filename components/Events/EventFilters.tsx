import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

const events = [
  { id: '1', name: 'React Conf', category: 'education', date: '2025-04-24' },
  { id: '2', name: 'Concert Sofia', category: 'music', date: '2025-05-02' },
  { id: '3', name: 'Football Final', category: 'sports', date: '2025-04-24' },
  { id: '4', name: 'AI Meetup', category: 'education', date: '2025-06-15' },
];

export default function EventSearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      const formatted = date.toISOString().split('T')[0];
      setSelectedDate(formatted);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedDate('');
  };

  const filteredEvents = events.filter(event => {
    const nameMatch = event.name.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = selectedCategory ? event.category === selectedCategory : true;
    const dateMatch = selectedDate ? event.date === selectedDate : true;

    return nameMatch && categoryMatch && dateMatch;
  });

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#fff' }}>
      <TextInput
        placeholder="Търси по име..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          borderRadius: 8,
          marginBottom: 10,
        }}
      />

      <Picker
        selectedValue={selectedCategory}
        onValueChange={(value) => setSelectedCategory(value)}
        style={{ marginBottom: 10 }}
      >
        <Picker.Item label="Всички категории" value="" />
        <Picker.Item label="Образование" value="education" />
        <Picker.Item label="Музика" value="music" />
        <Picker.Item label="Спорт" value="sports" />
      </Picker>

      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={{
          padding: 10,
          backgroundColor: '#eee',
          borderRadius: 8,
          marginBottom: 10,
        }}
      >
        <Text>{selectedDate ? `Дата: ${selectedDate}` : 'Избери дата'}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <TouchableOpacity onPress={clearFilters} style={{ marginBottom: 16 }}>
        <Text style={{ color: 'blue' }}>Изчисти филтрите</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 16,
              marginBottom: 10,
              backgroundColor: '#f9f9f9',
              borderRadius: 10,
              borderColor: '#ddd',
              borderWidth: 1,
            }}
          >
            <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
            <Text>Категория: {item.category}</Text>
            <Text>Дата: {item.date}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20 }}>Няма събития по зададените критерии.</Text>
        }
      />
    </View>
  );
}