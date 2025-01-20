import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet, Image, ScrollView } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Swiper from 'react-native-swiper';
import Header from '../components/Header';
import { AuthContext } from '../AuthContext';
import CustomButton from '../components/CustomButton';

const SearchScreen = () => <></>;

// Dummy components for each tab
const LoginPrompt = ({ navigation }) => (
  <View style={styles.centeredView}>
    <Text>Please log in to continue</Text>
    <Button title="Login" onPress={() => navigation.navigate('Auth', { screen: 'Login' })} />
  </View>
);

const ArtsScreen = ({ navigation }) => {
  const { isLoggedIn } = useContext(AuthContext);
  const [arts, setArts] = React.useState([]);

  React.useEffect(() => {
    const fetchArts = async () => {
      try {
        const response = await fetch('http://192.168.2.27:5001/api/arts');
        const data = await response.json();
        setArts(data);
      } catch (error) {
        console.error('Error fetching arts:', error);
      }
    };

    if (isLoggedIn) {
      fetchArts();
    }
  }, [isLoggedIn]);

  return isLoggedIn ? (
    <ScrollView style={styles.scrollView}>
      {arts.map((art, index) => (
        <View key={index} style={styles.artContainer}>
          <Text style={styles.artTitle}>{art.title}</Text>
          <Text style={styles.artCategory}>{art.category}</Text>
          <Text style={styles.artDescription}>{art.description}</Text>
          <Text style={styles.artPrice}>{art.price}</Text>
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
  const { isLoggedIn, logout } = useContext(AuthContext);

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
        <Text>Settings Content</Text>
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
});

export default HomeScreen;