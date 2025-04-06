import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../AuthContext';

const Header = ({ navigation, showBackButton }) => {
  const { isLoggedIn, userType } = useContext(AuthContext);

  const handleProfilePress = () => {
    try {
      if (isLoggedIn) {
        navigation.navigate('Home', { screen: 'Settings' });
      } else {
        navigation.navigate('Auth', { screen: 'Login' });
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handlePostPress = () => {
    console.log('User Type:', userType);
    if (!isLoggedIn) {
      navigation.navigate('Auth', { screen: 'Login' });
    } else {
      if (userType === 'Artist') {
        Alert.alert(
          'Post Options',
          'Choose an option',
          [
            { text: 'Post Art', onPress: () => navigation.navigate('PostArt') },
            { text: 'Post Event', onPress: () => navigation.navigate('PostEvent') },
          ],
          { cancelable: true }
        );
      } else if (userType === 'Customer') {
        Alert.alert(
          'Options',
          'Choose an option',
          [
            { text: 'Book Event', onPress: () => navigation.navigate('Home', { screen: 'Events' }) },
            { text: 'Buy Art', onPress: () => navigation.navigate('Home', { screen: 'Search' }) },
          ],
          { cancelable: true }
        );
      }
    }
  };

  return (
    <SafeAreaView>
      <View style={styles.header}>
        <View style={styles.leftContainer}>
          {showBackButton && navigation.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} />
            </TouchableOpacity>
          )}
          <View style={styles.titleContainer}>
            <Text style={styles.artText}>Art</Text>
            <Text style={styles.connectText}>
              <Text style={styles.c}>C</Text>
              <Text style={styles.o}>o</Text>
              <Text style={styles.n}>n</Text>
              <Text style={styles.n}>n</Text>
              <Text style={styles.e}>e</Text>
              <Text style={styles.c}>c</Text>
              <Text style={styles.t}>t</Text>
            </Text>
          </View>
        </View>
        <View style={styles.rightContainer}>
          <Ionicons
            name="add-circle-outline"
            size={45}
            color="#555"  // Set the same color as the profile button
            style={styles.icon}
            onPress={handlePostPress}
          />
          <Ionicons
            name="person-circle-outline"
            size={45}
            color="#555"
            style={styles.icon}
            onPress={handleProfilePress}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 4,
    backgroundColor: '#fff',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  artText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4682b4',
  },
  connectText: {
    fontSize: 24,
    fontWeight: 'bold',
    flexDirection: 'row',
  },
  c: {
    color: '#ff6347',
  },
  o: {
    color: '#ffa500',
  },
  n: {
    color: '#32cd32',
  },
  e: {
    color: '#1e90ff',
  },
  t: {
    color: '#8a2be2',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginLeft: 5,
  },
});

export default Header;