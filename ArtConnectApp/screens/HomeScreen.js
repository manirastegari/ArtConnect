import React, { useContext } from 'react';
import { SafeAreaView, View, Text, Button, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { AuthContext } from '../AuthContext';

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
  return isLoggedIn ? <View><Text>Arts Content</Text></View> : <LoginPrompt navigation={navigation} />;
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
  const { isLoggedIn } = useContext(AuthContext);
  return isLoggedIn ? <View><Text>Settings Content</Text></View> : <LoginPrompt navigation={navigation} />;
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
});

export default HomeScreen;