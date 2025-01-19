import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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

// const ArtsScreen = ({ navigation }) => {
//   const { isLoggedIn } = useContext(AuthContext);
//   return isLoggedIn ? <View><Text>Arts Content</Text></View> : <LoginPrompt navigation={navigation} />;
// };
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
    <View>
      {arts.map((art, index) => (
        <View key={index}>
          <Text>{art.title}</Text>
          <Text>{art.category}</Text>
          <Text>{art.description}</Text>
          <Text>{art.price}</Text>
          {art.images.map((image, imgIndex) => (
            <Image
              key={imgIndex}
              source={{ uri: `data:image/webp;base64,${image}` }}
              style={{ width: 200, height: 150 }}
            />
          ))}
        </View>
      ))}
    </View>
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
        // Include credentials if needed, e.g., cookies or tokens
        // credentials: 'include',
      });

      if (response.ok) {
        logout(); // Call the context logout function
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
        {/* Add other settings content here */}
      </View>
      <View style={styles.logoutButtonContainer}>
        <CustomButton
          text="Logout"
          color="#ff6347" // Example color
          width="80%" // Example width
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
    zIndex: 1, // Ensure the header is on top
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
    // Add any additional styling for the content here
  },
  logoutButtonContainer: {
    marginBottom: 20, // Add some margin if needed
    alignItems: 'center',
  },
});

export default HomeScreen;