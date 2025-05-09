import React, { useEffect, useState } from 'react';
import { View, TextInput, FlatList, StyleSheet, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import ItemCard from '../components/ItemCard';
import ItemCardRow from '../components/ItemCardRow';
import CustomButton from '../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import config from '../config';
import { Dimensions } from 'react-native';

const { height: screenHeight } = Dimensions.get('window');
const halfScreenHeight = screenHeight / 2;
const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [arts, setArts] = useState([]);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const navigation = useNavigation();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [selectedCategory]);

  const fetchInitialData = async () => {
    try {
      const artsResponse = await fetch(`${config.API_BASE_URL}/api/arts`);
      const artsData = await artsResponse.json();
      setArts(artsData);

      const eventsResponse = await fetch(`${config.API_BASE_URL}/api/events`);
      const eventsData = await eventsResponse.json();
      setEvents(eventsData);

      updateCategories([...artsData, ...eventsData]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchResults = async () => {
    try {
      const categoryParam = selectedCategory !== 'All' ? `&category=${selectedCategory}` : '';
      const artsResponse = await fetch(`${config.API_BASE_URL}/api/arts?query=${searchQuery}${categoryParam}`);
      const artsData = await artsResponse.json();
      setArts(artsData);

      const eventsResponse = await fetch(`${config.API_BASE_URL}/api/events?query=${searchQuery}${categoryParam}`);
      const eventsData = await eventsResponse.json();
      setEvents(eventsData);

      updateCategories([...artsData, ...eventsData]);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };


  const updateCategories = (items) => {
    const uniqueCategories = ['All', ...new Set(items.map(item => item.category))];
    setCategories(uniqueCategories);
  };


  const handleSearch = () => {
    fetchResults();
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
            {categories.map((category, index) => (
              <Picker.Item key={index} label={category} value={category} />
            ))}
          </Picker>
        </View>
      </View>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Arts</Text>
        <FlatList
          data={arts}
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
          style={styles.flatList}
        />
      </View>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Events</Text>
        <FlatList
          data={events}
          keyExtractor={(item) => item._id}
          numColumns={1}
          renderItem={({ item }) => (
            <ItemCardRow
              image={item.images[0]}
              title={item.title}
              category={item.category}
              price={item.price}
              onPress={() => navigation.navigate('EventDetails', { eventId: item._id })}
            />
          )}
          style={styles.flatList}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    backgroundColor: '#fff',
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
    marginLeft: 4,
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#fff',
  },
  sectionContainer: {
    flex: 1,
    // height: halfScreenHeight,,
    paddingBottom: 10,
    backgroundColor: '#d8ebff',
    borderRadius: 8,
    marginTop: 10,
  },
  sectionHeader: {
    color: '#4682b4',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: '#fff',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  flatList: {
    flex: 1,
  },
});

export default SearchScreen;