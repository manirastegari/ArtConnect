import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';
import Header from '../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../AuthContext';
import { Alert } from 'react-native';
import config from '../config';

const EventDetailsScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const { userId } = useContext(AuthContext);
  const [eventDetails, setEventDetails] = useState(null);
  const [artistDetails, setArtistDetails] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await fetch(`http://192.168.2.27:5001/api/events/${eventId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setEventDetails(data);

        // Fetch artist details
        const artistResponse = await fetch(`http://192.168.2.27:5001/api/users/details/${data.artistID}`);
        if (!artistResponse.ok) {
          throw new Error(`HTTP error! status: ${artistResponse.status}`);
        }
        const artistData = await artistResponse.json();
        setArtistDetails(artistData);

        // Check if the event is in user's favorites
        const userResponse = await fetch(`http://192.168.2.27:5001/api/users/details/${userId}`);
        const userData = await userResponse.json();
        const userFavorites = userData.favorites || [];
        setIsFavorite(userFavorites.includes(eventId));
      } catch (error) {
        console.error('Error fetching event details:', error);
        setError(error.message);
      }
    };

    fetchEventDetails();
  }, [eventId, userId]);

  const toggleFavorite = async () => {
    if (!userId) {
      Alert.alert('Login Required', 'You need to log in to add items to your favorites list.');
      return;
    }
  
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/users/toggle-favorite/${userId}/${eventId}`, {
        method: 'POST',
      });
  
      const contentType = response.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Unexpected response format:', text);
        throw new Error('Unexpected response format');
      }
  
      if (response.ok) {
        setIsFavorite(!isFavorite);
      } else {
        console.error('Error updating favorites:', data.error);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  if (!eventDetails || !artistDetails) {
    return <Text>Loading...</Text>;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header navigation={navigation} showBackButton={true} />
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{eventDetails.title}</Text>
          <TouchableOpacity onPress={toggleFavorite}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? 'red' : 'gray'}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.swiperContainer}>
          <Swiper showsButtons={true}>
            {eventDetails.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: `data:image/webp;base64,${image}` }}
                style={styles.image}
              />
            ))}
          </Swiper>
        </View>
        <Text style={styles.description}>{eventDetails.description}</Text>
        <Text style={styles.category}>Category: {eventDetails.category}</Text>
        <Text style={styles.date}>Date: {new Date(eventDetails.date).toLocaleDateString()}</Text>
        <Text style={styles.time}>Time: {eventDetails.time}</Text>

        {/* Artist Information */}
        <Text style={styles.artistInfoHeader}>Artist Information</Text>
        <View style={styles.artistContainer}>
          <Image
            source={{ uri: `data:image/webp;base64,${artistDetails.image}` }}
            style={styles.artistImage}
          />
          <Text style={styles.artistName}>{artistDetails.fullname}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  swiperContainer: {
    height: 220,
    marginVertical: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  description: {
    fontSize: 16,
    marginVertical: 10,
  },
  category: {
    fontSize: 16,
    color: '#666',
  },
  date: {
    fontSize: 16,
    color: '#000',
    marginVertical: 5,
  },
  time: {
    fontSize: 16,
    color: '#000',
    marginVertical: 5,
  },
  artistInfoHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  artistContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  artistImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  artistName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EventDetailsScreen;