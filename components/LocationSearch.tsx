import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

interface LocationSearchProps {
  onSelectLocation: (location: string, item?: LocationResult) => void;
}

interface LocationResult {
  display_name: string;
  lat: string;
  lon: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ onSelectLocation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Заменете с вашия API ключ от LocationIQ
  const LOCATIONIQ_API_KEY = 'pk.ec03b49d319c22cc4569574c50e8a04d';

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length > 2) {
        fetchLocations();
      } else {
        setResults([]);
      }
    }, 800); // Увеличен debounce timeout за LocationIQ rate limits

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://us1.locationiq.com/v1/search`,
        {
          params: {
            q: query,
            key: LOCATIONIQ_API_KEY,
            format: 'json',
            addressdetails: 1,
            limit: 5,
            'accept-language': 'bg', // Резултати на български език
            countrycodes: 'bg', // Приоритизиране на български локации
          }
        }
      );
      
      setResults(response.data.map((item: any) => ({
        display_name: item.display_name,
        lat: item.lat,
        lon: item.lon
      })));
      
    } catch (error) {
      console.error('LocationIQ fetch error:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          Alert.alert('Грешка', 'Прекалено много заявки. Моля, изчакайте.');
        } else {
          Alert.alert('Грешка', 'Възникна проблем при търсенето на локации.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: LocationResult) => {
    onSelectLocation(item.display_name, item);
    setQuery(item.display_name);
    setResults([]);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Търсене на място (град, адрес...)"
        placeholderTextColor="#999"
        value={query}
        onChangeText={setQuery}
      />
      
      {loading && <Text style={styles.loadingText}>Търсене на локации...</Text>}

      {!loading && results.length > 0 && (
        <FlatList
          data={results}
          style={styles.resultsList}
          keyExtractor={(item, index) => `${item.lat}-${item.lon}-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.item} 
              onPress={() => handleSelect(item)}
            >
              <Text style={styles.itemText}>{item.display_name}</Text>
            </TouchableOpacity>
          )}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    width: '100%',
    zIndex: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  resultsList: {
    maxHeight: 200,
    borderColor: '#eee',
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  item: {
    padding: 12,
    borderBottomColor: '#f5f5f5',
    borderBottomWidth: 1,
  },
  itemText: {
    fontSize: 15,
    color: '#333',
  },
  loadingText: {
    padding: 10,
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default LocationSearch;