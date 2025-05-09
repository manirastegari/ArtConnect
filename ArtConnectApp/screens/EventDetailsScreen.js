import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Swiper from 'react-native-swiper';
import Header from '../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../AuthContext';
import config from '../config';
import CustomButton from '../components/CustomButton';

const EventDetailsScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const { userId } = useContext(AuthContext);
  const [eventDetails, setEventDetails] = useState(null);
  const [artistDetails, setArtistDetails] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [error, setError] = useState(null);



  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        console.log(`Fetching event details for ID: ${eventId}`);
        const response = await fetch(`${config.API_BASE_URL}/api/events/${eventId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setEventDetails(data);
  
        // Fetch artist details
        const artistResponse = await fetch(`${config.API_BASE_URL}/api/users/details/${data.artistID}`);
        if (!artistResponse.ok) {
          throw new Error(`HTTP error! status: ${artistResponse.status}`);
        }
        const artistData = await artistResponse.json();
        setArtistDetails(artistData.user);
  
        // Check if the event is in user's favorites and followed list
        const userResponse = await fetch(`${config.API_BASE_URL}/api/users/details/${userId}`);
        const userData = await userResponse.json();
        if (userData && userData.user) {
          const favorites = userData.favorites || [];
  
          console.log('User favorites:', favorites);
  
          setIsFavorite(favorites.includes(eventId));
          console.log('Is favorite:', isFavorite);
          setIsFollowing(userData.user.followed.map(follow => follow._id).includes(data.artistID));
        } else {
          console.error('User data is undefined or does not contain expected structure');
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
        setError(error.message);
      }
    };
  
    fetchEventDetails();
  }, [eventId, userId]);
  // useEffect(() => {
  //   const fetchEventDetails = async () => {
  //     try {
  //       console.log(`Fetching event details for ID: ${eventId}`);
  //       const response = await fetch(`${config.API_BASE_URL}/api/events/${eventId}`);
  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }
  //       const data = await response.json();
  //       setEventDetails(data);

  //       // Fetch artist details
  //       const artistResponse = await fetch(`${config.API_BASE_URL}/api/users/details/${data.artistID}`);
  //       if (!artistResponse.ok) {
  //         throw new Error(`HTTP error! status: ${artistResponse.status}`);
  //       }
  //       const artistData = await artistResponse.json();
  //       setArtistDetails(artistData.user);

        
  //       // Check if the event is in user's favorites and followed list
  //       const userResponse = await fetch(`${config.API_BASE_URL}/api/users/details/${userId}`);
  //       const userData = await userResponse.json();
  //         if (userData && userData.user) {
  //         // const userFavorites = userData.favorites || [];
  //         // const userFollowed = userData.followed || [];
  //         const userFavorites = userData.user.favorites.map(fav => fav._id) || []; // Extract IDs
  //         const userFollowed = userData.user.followed.map(follow => follow._id) || []; // Extract IDs

  //         console.log('User favorites:', userFavorites);
  //         setIsFavorite(userFavorites.includes(eventId));
  //         console.log('Is favorite:', isFavorite);
  //         setIsFollowing(userFollowed.includes(data.artistID));
  //       } else {
  //         console.error('User data is undefined or does not contain expected structure');
  //       }
  //     } catch (error) {
  //       console.error('Error fetching event details:', error);
  //       setError(error.message);
  //     }
  //   };

  //   fetchEventDetails();
  // }, [eventId, userId]);

  const toggleFavorite = async () => {
    if (!userId) {
      Alert.alert('Login Required', 'You need to log in to add items to your favorites list.');
      return;
    }
  
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/users/toggle-favorite/${userId}/${eventId}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok) {
        setIsFavorite(!isFavorite);
      } else {
        console.error('Error updating favorites:', data.error);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const toggleFollow = async () => {
    if (!userId) {
      Alert.alert('Login Required', 'You need to log in to follow artists.');
      return;
    }

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/users/toggle-follow/${userId}/${artistDetails._id}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok) {
        setIsFollowing(!isFollowing);
      } else {
        console.error('Error updating follow status:', data.error);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
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
        <Text style={styles.category}>
          <Text style={styles.boldText}>Category:</Text> {eventDetails.category}
        </Text>
        <Text style={styles.date}>
          <Text style={styles.boldText}>Date:</Text> {new Date(eventDetails.date).toLocaleDateString()}
        </Text>
        <Text style={styles.time}>
          <Text style={styles.boldText}>Time:</Text> {eventDetails.time}
        </Text>
        <Text style={styles.venueCapacity}>
          <Text style={styles.boldText}>Venue Capacity:</Text> {eventDetails.venueCapacity}
        </Text>

        {/* Main content area */}
        <View style={{ flex: 1 }} />

        {/* Footer content */}
        <View style={styles.footer}>
          <CustomButton
            text="BOOK"
            color="#4682b4"
            width="100%"
            onPress={() => {
              if (!userId) {
                navigation.navigate('Auth', { screen: 'Login' });
              } else {
                navigation.navigate('Order', { itemId: eventId, itemType: 'Event' });
              }
            }}
          />

          <View style={styles.horizontalLine} />

          <Text style={styles.artistInfoHeader}>Artist Information</Text>
          <View style={styles.artistContainer}>
            <View style={styles.artistInfo}>
              <Image
                source={{ uri: `data:image/webp;base64,${artistDetails.image}` }}
                style={styles.artistImage}
              />
              <Text style={styles.artistName}>{artistDetails.fullname}</Text>
            </View>
            <CustomButton
              text={isFollowing ? "Followed" : "Follow"}
              color="lightgray"
              width={80}
              onPress={toggleFollow}
            />
          </View>
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
    marginVertical: 5,
  },
  swiperContainer: {
    height: 220,
    marginVertical: 5,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  description: {
    fontSize: 16,
    marginVertical: 5,
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
  venueCapacity: {
    fontSize: 16,
    color: '#000',
    marginVertical: 5,
  },
  artistInfoHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'center',
  },
  artistContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  artistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
  horizontalLine: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginVertical: 10,
  },
  footer: {
    paddingVertical: 10,
  },
  boldText: {
    fontWeight: 'bold',
  },
});

export default EventDetailsScreen;