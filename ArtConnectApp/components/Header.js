import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../AuthContext';
import CustomButton from './CustomButton';

const Header = ({ navigation, showBackButton }) => {
  const { isLoggedIn } = useContext(AuthContext);

  const handleProfilePress = () => {
    if (isLoggedIn) {
      navigation.navigate('Home', { screen: 'Settings' });
    } else {
      navigation.navigate('Auth', { screen: 'Login' });
    }
  };

  const handlePostPress = () => {
    if (!isLoggedIn) {
      navigation.navigate('Auth', { screen: 'Login' });
    } else {
      Alert.alert(
        'Post Options',
        'Choose an option',
        [
          { text: 'Post Art', onPress: () => navigation.navigate('PostArt') },
          { text: 'Post Event', onPress: () => navigation.navigate('PostEvent') },
        ],
        { cancelable: true }
      );
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
          <CustomButton
            text="Post"
            color="#4682b4"
            width={80}
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
    color: '#4682b4', // Example color for "Art"
  },
  connectText: {
    fontSize: 24,
    fontWeight: 'bold',
    flexDirection: 'row',
  },
  c: {
    color: '#ff6347', // Example color for 'C'
  },
  o: {
    color: '#ffa500', // Example color for 'o'
  },
  n: {
    color: '#32cd32', // Example color for 'n'
  },
  e: {
    color: '#1e90ff', // Example color for 'e'
  },
  t: {
    color: '#8a2be2', // Example color for 't'
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginLeft: 10,
  },
});

export default Header;