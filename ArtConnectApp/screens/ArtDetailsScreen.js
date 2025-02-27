import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Swiper from 'react-native-swiper';
import Header from '../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../AuthContext';
import config from '../config';
import CustomButton from '../components/CustomButton';

const ArtDetailsScreen = ({ route, navigation }) => {
  const { artId } = route.params;
  const { userId } = useContext(AuthContext);
  const [artDetails, setArtDetails] = useState(null);
  const [artistDetails, setArtistDetails] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtDetails = async () => {
      try {
        console.log(`Fetching art details for ID: ${artId}`);
        const response = await fetch(`${config.API_BASE_URL}/api/arts/${artId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setArtDetails(data);
  
        // Fetch artist details
        const artistResponse = await fetch(`${config.API_BASE_URL}/api/users/details/${data.artistID}`);
        if (!artistResponse.ok) {
          throw new Error(`HTTP error! status: ${artistResponse.status}`);
        }
        const artistData = await artistResponse.json();
        setArtistDetails(artistData.user);
  
        // Fetch user details
        const userResponse = await fetch(`${config.API_BASE_URL}/api/users/details/${userId}`);
        const userData = await userResponse.json();
  
        // Log the entire user data response ..
        // console.log('User data response:', userData);
  
        if (userData && userData.user) {
          const userFavorites = userData.user.favorites.map(fav => fav._id) || []; // Extract IDs
          const userFollowed = userData.user.followed.map(follow => follow._id) || []; // Extract IDs
  
          console.log('User favorites:', userFavorites); // Log the extracted IDs.
          setIsFavorite(userFavorites.includes(artId));
          console.log('Is favorite:', isFavorite); // Log the state.a
  
          setIsFollowing(userFollowed.includes(data.artistID));
          console.log('Is favorite:', isFavorite);
        } else {
          console.error('User data is undefined or does not contain expected structure');
        }
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
      const response = await fetch(`${config.API_BASE_URL}/api/users/toggle-favorite/${userId}/${artId}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok) {
        // setIsFavorite(!isFavorite);
        setIsFavorite(data.favorites.includes(artId));
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
      const response = await fetch(`${config.API_BASE_URL}/api/users/toggle-follow/${userId}/${artDetails.artistID}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok) {
        // setIsFollowing(!isFollowing);
        setIsFollowing(data.followed.includes(artDetails.artistID));
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

        {/* Main content area */}
        <View style={{ flex: 1 }} />

        {/* Footer content */}
        <View style={styles.footer}>
          <CustomButton
            text="BUY"
            color="#4682b4"
            width="100%"
            onPress={() => {
              if (!userId) {
                navigation.navigate('Auth', { screen: 'Login' });
              } else {
                navigation.navigate('Order', { itemId: artId, itemType: 'Art' });
              }
            }}
          />

          <View style={styles.horizontalLine} />

          <Text style={styles.artistInfoHeader}>Artist Information</Text>
          <View style={styles.artistContainer}>
            <View style={styles.artistInfo}>
              {artistDetails.image ? (
                <Image
                  source={{ uri: `data:image/webp;base64,${artistDetails.image}` }}
                  style={styles.artistImage}
                />
              ) : null}
              <Text style={styles.artistName}>{artistDetails.fullname || 'Unknown Artist'}</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
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
});

export default ArtDetailsScreen;