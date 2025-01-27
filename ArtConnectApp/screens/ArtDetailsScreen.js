import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Swiper from 'react-native-swiper';
import Header from '../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';

const ArtDetailsScreen = ({ route, navigation }) => {
  const { artId } = route.params;
  const [artDetails, setArtDetails] = useState(null);
  const [artistDetails, setArtistDetails] = useState(null);
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
      } catch (error) {
        console.error('Error fetching art details:', error);
        setError(error.message);
      }
    };

    fetchArtDetails();
  }, [artId]);

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
        <Text style={styles.title}>{artDetails.title || 'Untitled'}</Text>
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
