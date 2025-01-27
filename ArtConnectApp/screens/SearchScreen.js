import React, { useEffect, useState } from 'react';
import { View, TextInput, FlatList, StyleSheet, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import ItemCard from '../components/ItemCard';
import CustomButton from '../components/CustomButton';
import { useNavigation } from '@react-navigation/native';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [arts, setArts] = useState([]);
  const [events, setEvents] = useState([]);
  const [filteredArts, setFilteredArts] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  const navigation = useNavigation();

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

        updateCategories([...artsData, ...eventsData]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    filterResults();
  }, [selectedCategory]);

  const updateCategories = (items) => {
    const allCategories = [...new Set(items.map(item => item.category))];
    setCategories(allCategories);
  };

  const handleSearch = () => {
    filterResults();
  };

  const filterResults = () => {
    const query = searchQuery.toLowerCase();
    const artsResults = arts.filter(art =>
      (art.title.toLowerCase().includes(query) || art.description.toLowerCase().includes(query)) &&
      (selectedCategory ? art.category === selectedCategory : true)
    );
    const eventsResults = events.filter(event =>
      (event.title.toLowerCase().includes(query) || event.description.toLowerCase().includes(query)) &&
      (selectedCategory ? event.category === selectedCategory : true)
    );
    setFilteredArts(artsResults);
    setFilteredEvents(eventsResults);
    updateCategories([...artsResults, ...eventsResults]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <CustomButton
          text="Search"
          onPress={handleSearch}
          color="#4682b4"
          width="18%"
          height={49}
        />
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCategory}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          >
            <Picker.Item label="All Categories" value="" />
            {categories.map((category, index) => (
              <Picker.Item key={index} label={category} value={category} />
            ))}
          </Picker>
        </View>
      </View>
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
            onPress={() => navigation.navigate('ArtDetails', { artId: item._id })}
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
            onPress={() => navigation.navigate('EventDetails', { eventId: item._id })}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginHorizontal: 5,
    paddingHorizontal: 8,
  },
  pickerContainer: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    justifyContent: 'center',
    backgroundColor: '#4682b4',
    overflow: 'hidden',
    marginLeft: 4
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#fff',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 3,
    textAlign: 'center',
  },
});

export default SearchScreen;