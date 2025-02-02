import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';
import Header from '../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../AuthContext';
import { Alert } from 'react-native';

const ArtDetailsScreen = ({ route, navigation }) => {
  const { artId } = route.params;
  const { userId } = useContext(AuthContext);
  const [artDetails, setArtDetails] = useState(null);
  const [artistDetails, setArtistDetails] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchArtDetails = async () => {
      try {
        const response = await fetch(`http://192.168.2.27:5001/api/arts/${artId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setArtDetails(data);

        // Fetch artist details
        const artistResponse = await fetch(`http://192.168.2.27:5001/api/users/details/${data.artistID}`);
        if (!artistResponse.ok) {
          throw new Error(`HTTP error! status: ${artistResponse.status}`);
        }
        const artistData = await artistResponse.json();
        setArtistDetails(artistData);

        // Check if the art is in user's favorites
        const userResponse = await fetch(`http://192.168.2.27:5001/api/users/details/${userId}`);
        const userData = await userResponse.json();
        const userFavorites = userData.favorites || [];

        // Debugging logs
        console.log('User Favorites:', userFavorites);
        console.log('Current Art ID:', artId);
        console.log('Is Favorite:', userFavorites.includes(artId));
        
        setIsFavorite(userFavorites.includes(artId));
      } catch (error) {
        console.error('Error fetching art details:', error);
        setError(error.message);
      }
    };

    fetchArtDetails();
  }, [artId, userId]);

  const toggleFavorite = async () => {
    if (!userId) {
      Alert.alert('Login Required', 'You need to log in to add items to your favorites list.');
      return;
    }
  
    try {
      const response = await fetch(`http://192.168.2.27:5001/api/users/toggle-favorite/${userId}/${artId}`, {
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

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  if (!artDetails || !artistDetails) {
    return <Text>Loading...</Text>;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Header navigation={navigation} showBackButton={true} />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{artDetails.title || 'Untitled'}</Text>
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
            {artDetails.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: `data:image/webp;base64,${image}` }}
                style={styles.image}
              />
            ))}
          </Swiper>
        </View>
        <Text style={styles.description}>{artDetails.description || 'No description available.'}</Text>
        <Text style={styles.category}>Category: {artDetails.category || 'N/A'}</Text>
        <Text style={styles.price}>Price: ${artDetails.price || 'N/A'}</Text>
        
        <Text style={styles.artistInfoHeader}>Artist Information</Text>
        <View style={styles.artistContainer}>
          {artistDetails.image ? (
            <Image
              source={{ uri: `data:image/webp;base64,${artistDetails.image}` }}
              style={styles.artistImage}
            />
          ) : null}
          <Text style={styles.artistName}>{artistDetails.fullname || 'Unknown Artist'}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  price: {
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

export default ArtDetailsScreen;