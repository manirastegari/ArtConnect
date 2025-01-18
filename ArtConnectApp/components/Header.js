import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../AuthContext';

const Header = ({ navigation, showBackButton }) => {
  const { isLoggedIn } = useContext(AuthContext);

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
          <Text style={styles.title}>ArtConnect</Text>
        </View>
        <View style={styles.rightContainer}>
          <Button title="Post" onPress={handlePostPress} />
          <Ionicons
            name="person-circle-outline"
            size={24}
            style={styles.icon}
            onPress={() => navigation.navigate('Auth')}
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
    padding: 10,
    backgroundColor: '#fff',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
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