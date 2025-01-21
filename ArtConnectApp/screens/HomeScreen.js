import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Swiper from 'react-native-swiper';
import Header from '../components/Header';
import { AuthContext } from '../AuthContext';
import CustomButton from '../components/CustomButton';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import defaultUserImage from '../assets/userImage.png';

const SearchScreen = () => <></>;

// Dummy components for each tab
const LoginPrompt = ({ navigation }) => (
  <View style={styles.centeredView}>
    <Text>Please log in to continue</Text>
    <CustomButton
      text="Login"
      onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
      color="#4682b4" // You can choose any color you prefer
      width="80%" // Adjust the width as needed
    />
  </View>
);

const ArtsScreen = ({ navigation }) => {
  const { isLoggedIn, userId } = useContext(AuthContext);
  const [arts, setArts] = useState([]);
  const [events, setEvents] = useState([]);
  const [userImage, setUserImage] = useState(null);

  useEffect(() => {
    const fetchArtsAndEvents = async () => {
      try {
        const artsResponse = await fetch('http://192.168.2.27:5001/api/arts');
        const artsData = await artsResponse.json();
        // Filter arts by artistID
        const userArts = artsData.filter(art => art.artistID === userId);
        setArts(userArts);

        const eventsResponse = await fetch('http://192.168.2.27:5001/api/events');
        const eventsData = await eventsResponse.json();
        // Filter events by artistID
        const userEvents = eventsData.filter(event => event.artistID === userId);
        setEvents(userEvents);

        const userResponse = await fetch(`http://192.168.2.27:5001/api/users/details/${userId}`);
        const userData = await userResponse.json();
        setUserImage(userData.image);
      } catch (error) {
        console.error('Error fetching arts, events, or user image:', error);
      }
    };

    if (isLoggedIn) {
      fetchArtsAndEvents();
    }
  }, [isLoggedIn, userId]);

  const selectImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      console.log('Image URI:', result.assets[0].uri);
      const formData = new FormData();
      formData.append('image', {
        uri: result.assets[0].uri,
        type: 'image/jpeg',
        name: 'userImage.jpg',
      });
      // formData.append('userId', userId);

      try {
        const response = await fetch(`http://192.168.2.27:5001/api/users/update-image/${userId}`, {
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
        // console.error('Error updating image:', error);
        Alert.alert('Error', 'Something went wrong. Please try again later.');
      }
    }
  };

  return isLoggedIn ? (
    <ScrollView style={styles.scrollView}>
      <TouchableOpacity onPress={selectImage}>
        <Image
          source={userImage ? { uri: `data:image/webp;base64,${userImage}` } : defaultUserImage}
          style={styles.userImage}
        />
      </TouchableOpacity>
      <Text style={styles.sectionHeader}>Posted Arts</Text>
      {arts.map((art, index) => (
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
      ))}
      <Text style={styles.sectionHeader}>Posted Events</Text>
      {events.map((event, index) => (
        <View key={`event-${index}`} style={styles.artContainer}>
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
      ))}
    </ScrollView>
  ) : (
    <LoginPrompt navigation={navigation} />
  );
};

const EventsScreen = ({ navigation }) => {
  const { isLoggedIn } = useContext(AuthContext);
  return isLoggedIn ? <View><Text>Events Content</Text></View> : <LoginPrompt navigation={navigation} />;
};

const FavoritesScreen = ({ navigation }) => {
  const { isLoggedIn } = useContext(AuthContext);
  return isLoggedIn ? <View><Text>Favorites Content</Text></View> : <LoginPrompt navigation={navigation} />;
};

const SettingsScreen = ({ navigation }) => {
  const { isLoggedIn, logout, userId } = useContext(AuthContext);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`http://192.168.2.27:5001/api/users/details/${userId}`);
        const data = await response.json();
        if (response.ok) {
          setUserDetails(data);
        } else {
          Alert.alert('Error', data.error);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        Alert.alert('Error', 'Something went wrong. Please try again later.');
      }
    };

    if (isLoggedIn) {
      fetchUserDetails();
    }
  }, [isLoggedIn, userId]);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://192.168.2.27:5001/api/users/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        logout();
        navigation.navigate('Search');
      } else {
        console.error('Failed to log out');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return isLoggedIn ? (
    <View style={styles.container}>
      <View style={styles.content}>
        {userDetails ? (
          <>
            <Text>Name: {userDetails.fullname}</Text>
            <Text>Email: {userDetails.email}</Text>
            <Text>User Type: {userDetails.type}</Text>
          </>
        ) : (
          <Text>Loading user details...</Text>
        )}
      </View>
      <View style={styles.logoutButtonContainer}>
        <CustomButton
          text="Logout"
          color="#ff6347"
          width="80%"
          onPress={handleLogout}
        />
      </View>
    </View>
  ) : (
    <LoginPrompt navigation={navigation} />
  );
};

const Tab = createBottomTabNavigator();

const HomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Header navigation={navigation} />
      </View>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'Search') {
              iconName = 'search';
            } else if (route.name === 'Arts') {
              iconName = 'brush';
            } else if (route.name === 'Events') {
              iconName = 'calendar';
            } else if (route.name === 'Favorites') {
              iconName = 'heart';
            } else if (route.name === 'Settings') {
              iconName = 'settings';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="Arts" component={ArtsScreen} />
        <Tab.Screen name="Events" component={EventsScreen} />
        <Tab.Screen name="Favorites" component={FavoritesScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    zIndex: 1,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
  },
  logoutButtonContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  userImage: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: '#777',
    borderRadius: 50,
    alignSelf: 'center',
    marginVertical: 20,
  },
  artContainer: {
    marginBottom: 20,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
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
    height: 200,
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
  artTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  artPrice: {
    fontSize: 16,
    color: '#000',
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
});

export default HomeScreen;