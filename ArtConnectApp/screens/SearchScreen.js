import React, { useEffect, useState } from 'react';
import { View, TextInput, FlatList, StyleSheet, Text } from 'react-native';
import ItemCard from '../components/ItemCard';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [arts, setArts] = useState([]);
  const [events, setEvents] = useState([]);
  const [filteredArts, setFilteredArts] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const artsResponse = await fetch('http://192.168.2.27:5001/api/arts');
        const artsData = await artsResponse.json();
        setArts(artsData);
        setFilteredArts(artsData);

        const eventsResponse = await fetch('http://192.168.2.27:5001/api/events');
        const eventsData = await eventsResponse.json();
        setEvents(eventsData);
        setFilteredEvents(eventsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setFilteredArts(arts.filter(art => art.title.toLowerCase().includes(query.toLowerCase())));
    setFilteredEvents(events.filter(event => event.title.toLowerCase().includes(query.toLowerCase())));
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <Text style={styles.sectionHeader}>Arts</Text>
      <FlatList
        data={filteredArts}
        keyExtractor={(item) => item._id}
        numColumns={2}
        renderItem={({ item }) => (
          <ItemCard
            image={item.images[0]}
            title={item.title}
            category={item.category}
            price={item.price}
          />
        )}
      />
      <Text style={styles.sectionHeader}>Events</Text>
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item._id}
        numColumns={2}
        renderItem={({ item }) => (
          <ItemCard
            image={item.images[0]}
            title={item.title}
            category={item.category}
            price={item.price}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 5,
    paddingHorizontal: 8,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 3,
    textAlign: 'center',
  },
});

export default SearchScreen;