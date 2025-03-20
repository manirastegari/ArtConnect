import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert, StyleSheet, Dimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Swiper from 'react-native-swiper';
import { AuthContext } from '../AuthContext';
import * as ImagePicker from 'expo-image-picker';
import defaultUserImage from '../assets/userImage.png';
import config from '../config';
import CustomButton from '../components/CustomButton';

// Component to prompt login ...................
const LoginPrompt = ({ navigation }) => (
  <View style={styles.centeredView}>
    <Text>Please log in to continue</Text>
    <CustomButton
      text="Login"
      onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
      color="#4682b4"
      width="80%"
    />
  </View>
);

const DashboardScreen = ({ navigation }) => {
  const { isLoggedIn, userId } = useContext(AuthContext);
  const [arts, setArts] = useState([]);
  const [events, setEvents] = useState([]);
  const [postedArts, setPostedArts] = useState([]);
  const [postedEvents, setPostedEvents] = useState([]);
  const [userImage, setUserImage] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'purchasedArts', title: 'Purchased Arts' },
    { key: 'bookedEvents', title: 'Booked Events' },
    { key: 'postedArts', title: 'Posted Arts' },
    { key: 'postedEvents', title: 'Posted Events' },
  ]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await fetch(`${config.API_BASE_URL}/api/users/details/${userId}`);
        const data = await userResponse.json();
        
        if (userResponse.ok && data.user) {
          setArts(data.user.purchasedArts);
          setEvents(data.user.bookedEvents);
          setPostedArts(data.postedArts);
          setPostedEvents(data.postedEvents);
          setUserImage(data.user.image);
          setUserDetails(data.user);
        } else {
          console.error('Error fetching user data:', data.error || 'Unexpected response structure');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
  
    if (isLoggedIn) {
      fetchUserData();
    }
  }, [isLoggedIn, userId]);

  const selectImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const formData = new FormData();
      formData.append('image', {
        uri: result.assets[0].uri,
        type: 'image/jpeg',
        name: 'userImage.jpg',
      });

      try {
        const response = await fetch(`${config.API_BASE_URL}/api/users/update-image/${userId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });

        const data = await response.json();
        if (response.ok) {
          setUserImage(data.image);
          Alert.alert('Success', 'Image updated successfully');
        } else {
          Alert.alert('Error', data.error || 'Unknown error');
        }
      } catch (error) {
        Alert.alert('Error', 'Something went wrong. Please try again later.');
      }
    }
  };

  const fetchEventDetails = async (eventId) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/events/${eventId}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching event details:', error);
      return null;
    }
  };

  const renderScene = SceneMap({
    purchasedArts: () => (
      <ScrollView style={styles.scrollView}>
        {arts.length > 0 ? arts.map((art, index) => (
          <View key={`art-${index}`} style={styles.artContainer}>
            <View style={styles.titlePriceContainer}>
              <Text style={styles.artTitle}>{art.title}</Text>
              <Text style={styles.artPrice}>$ {art.price}</Text>
            </View>
            <Text style={styles.artCategory}>{art.category}</Text>
            <Text style={styles.artDescription}>{art.description}</Text>
            <Swiper style={styles.wrapper} showsButtons={true}>
              {art.images.map((image, imgIndex) => (
                <Image
                  key={imgIndex}
                  source={{ uri: `data:image/webp;base64,${image}` }}
                  style={styles.artImage}
                />
              ))}
            </Swiper>
          </View>
        )) : <Text style={styles.noItemsText}>You have no purchased arts.</Text>}
      </ScrollView>
    ),
    bookedEvents: () => (
      <ScrollView style={styles.scrollView}>
        {events.length > 0 ? events.map((booking, index) => {
          const [eventDetails, setEventDetails] = useState(null);

          useEffect(() => {
            const fetchDetails = async () => {
              const details = await fetchEventDetails(booking.eventId);
              setEventDetails(details);
            };
            fetchDetails();
          }, [booking.eventId]);

          if (!eventDetails) {
            return <Text key={`loading-${index}`}>Loading...</Text>;
          }

          return (
            <View key={`event-${index}`} style={styles.artContainer}>
              <View style={styles.titlePriceContainer}>
                <Text style={styles.artTitle}>{eventDetails.title}</Text>
                <Text style={styles.artPrice}>$ {eventDetails.price}</Text>
              </View>
              <Text style={styles.artCategory}>{eventDetails.category}</Text>
              <Text style={styles.artDescription}>{eventDetails.description}</Text>
              <View style={styles.dateTimeContainer}>
                <Text style={styles.artDate}>Date: {new Date(eventDetails.date).toLocaleDateString()}</Text>
                <Text style={styles.artTime}>Time: {eventDetails.time}</Text>
                <Text style={styles.artSeats}>Seats Booked: {booking.seats}</Text>
              </View>
              <Swiper style={styles.wrapper} showsButtons={true}>
                {eventDetails.images.map((image, imgIndex) => (
                  <Image
                    key={imgIndex}
                    source={{ uri: `data:image/webp;base64,${image}` }}
                    style={styles.artImage}
                  />
                ))}
              </Swiper>
            </View>
          );
        }) : <Text style={styles.noItemsText}>You have no booked events.</Text>}
      </ScrollView>
    ),
    postedArts: () => (
      <ScrollView style={styles.scrollView}>
        {postedArts.length > 0 ? postedArts.map((art, index) => (
          <View key={`posted-art-${index}`} style={styles.artContainer}>
            <View style={styles.titlePriceContainer}>
              <Text style={styles.artTitle}>{art.title}</Text>
              <Text style={styles.artPrice}>$ {art.price}</Text>
            </View>
            <Text style={styles.artCategory}>{art.category}</Text>
            <Text style={styles.artDescription}>{art.description}</Text>
            <Swiper style={styles.wrapper} showsButtons={true}>
              {art.images.map((image, imgIndex) => (
                <Image
                  key={imgIndex}
                  source={{ uri: `data:image/webp;base64,${image}` }}
                  style={styles.artImage}
                />
              ))}
            </Swiper>
          </View>
        )) : <Text style={styles.noItemsText}>You have no posted arts.</Text>}
      </ScrollView>
    ),
    postedEvents: () => (
      <ScrollView style={styles.scrollView}>
        {postedEvents.length > 0 ? postedEvents.map((event, index) => (
          <View key={`posted-event-${index}`} style={styles.artContainer}>
            <View style={styles.titlePriceContainer}>
              <Text style={styles.artTitle}>{event.title}</Text>
              <Text style={styles.artPrice}>$ {event.price}</Text>
            </View>
            <Text style={styles.artCategory}>{event.category}</Text>
            <Text style={styles.artDescription}>{event.description}</Text>
            <View style={styles.dateTimeContainer}>
              <Text style={styles.artDate}>Date: {new Date(event.date).toLocaleDateString()}</Text>
              <Text style={styles.artTime}>Time: {event.time}</Text>
            </View>
            <Swiper style={styles.wrapper} showsButtons={true}>
              {event.images.map((image, imgIndex) => (
                <Image
                  key={imgIndex}
                  source={{ uri: `data:image/webp;base64,${image}` }}
                  style={styles.artImage}
                />
              ))}
            </Swiper>
          </View>
        )) : <Text style={styles.noItemsText}>You have no posted events.</Text>}
      </ScrollView>
    ),
  });

  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: '#4682b4' }} // Color of the indicator
      style={{ backgroundColor: '#f9f9f9' }} // Background color of the tab bar
      labelStyle={{ color: '#333' }} // Color of the tab labels
      activeColor="#4682b4" // Color of the active tab label
      inactiveColor="#999" // Color of the inactive tab labels
    />
  );

  return isLoggedIn ? (
    <View style={{ flex: 1 }}>
      <View style={styles.userInfoContainer}>
        <TouchableOpacity onPress={selectImage}>
          <Image
            source={userImage ? { uri: `data:image/webp;base64,${userImage}` } : defaultUserImage}
            style={styles.userImage}
          />
        </TouchableOpacity>
        <Text style={styles.userName}>{userDetails?.fullname || 'User'}</Text>
      </View>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
        renderTabBar={renderTabBar}
      />
    </View>
  ) : (
    <LoginPrompt navigation={navigation} />
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#777',
    backgroundColor: '#f9f9f9',
  },
  userImage: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#777',
    borderRadius: 50,
    marginRight: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artContainer: {
    marginBottom: 10,
    padding: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#999',
  },
  artTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  artCategory: {
    fontSize: 16,
    color: '#666',
  },
  artDescription: {
    fontSize: 14,
    color: '#333',
  },
  artPrice: {
    fontSize: 16,
    color: '#000',
  },
  wrapper: {
    height: 250,
    borderRadius: 10,
  },
  artImage: {
    width: '100%',
    height: 230,
    marginVertical: 10,
    borderRadius: 10,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  titlePriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  artDate: {
    fontSize: 14,
    color: '#333',
  },
  artTime: {
    fontSize: 14,
    color: '#333',
  },
  artSeats: {
    fontSize: 14,
    color: '#333',
  },
  noItemsText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
    color: '#999',
  },
});

export default DashboardScreen;