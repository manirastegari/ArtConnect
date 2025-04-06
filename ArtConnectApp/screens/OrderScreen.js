import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import config from '../config';
import CustomButton from '../components/CustomButton';

const OrderScreen = ({ route, navigation }) => {
  const { itemId, itemType } = route.params;
  const { userId } = useContext(AuthContext);
  const [itemDetails, setItemDetails] = useState(null);
  const [artistName, setArtistName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [seats, setSeats] = useState(1);

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        const response = await fetch(`${config.API_BASE_URL}/api/${itemType.toLowerCase()}s/${itemId}`);
        const data = await response.json();
        setItemDetails(data);
        console.log('Item Details:', data);

        const artistResponse = await fetch(`${config.API_BASE_URL}/api/users/details/${data.artistID}`);
        const artistData = await artistResponse.json();
        console.log('Artist Data:', artistData);

        setArtistName(artistData.user.fullname);
      } catch (error) {
        console.error('Error fetching item details:', error);
      }
    };

    fetchItemDetails();
  }, [itemId, itemType]);

  const handleCompleteOrder = async () => {
    if (!address || !phone) {
      Alert.alert('Error', 'Please provide delivery address and phone number.');
      return;
    }

    try {
      if (itemType.toLowerCase() === 'art') {
        await fetch(`${config.API_BASE_URL}/api/${itemType.toLowerCase()}s/${itemId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isAvailable: false }),
        });
      }

      await fetch(`${config.API_BASE_URL}/api/users/complete-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, itemId, itemType, seats }),
      });

      Alert.alert('Success', 'Order has been completed.');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error completing order:', error);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    }
  };

  if (!itemDetails) {
    return <Text>Loading...</Text>;
  }

  const price = itemDetails.price * (itemType.toLowerCase() === 'event' ? seats : 1);
  const deliveryFee = price * 0.05;
  const tax = price * 0.13;
  const totalPrice = price + deliveryFee + tax;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header navigation={navigation} showBackButton={true} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View>
          <View style={styles.section}>
            <Text style={styles.header}>Order Details</Text>
            <Text>Title: {itemDetails.title}</Text>
            <Text>Type: {itemType}</Text>
            <Text>Artist: {artistName}</Text>
            {itemType.toLowerCase() === 'event' && (
              <>
                <Text>Date: {new Date(itemDetails.date).toLocaleDateString()}</Text>
                <Text>Time: {itemDetails.time}</Text>

                <View style={styles.capacityContainer}>
                <Text style={styles.subHeader}>Number of Seats: {seats}</Text>
                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={styles.capacityButton}
                    onPress={() => setSeats(prev => Math.max(1, prev - 1))}
                  >
                    <Text style={styles.buttonText}>-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.capacityButton}
                    onPress={() => setSeats(prev => Math.min(itemDetails.venueCapacity, prev + 1))}
                  >
                    <Text style={styles.buttonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              </>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.header}>Pricing</Text>
            <Text>Price: ${price.toFixed(2)}</Text>
            <Text>Delivery Fee: ${deliveryFee.toFixed(2)}</Text>
            <Text>Tax: ${tax.toFixed(2)}</Text>
            <Text>Total: ${totalPrice.toFixed(2)}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.header}>Delivery Information</Text>
            <TextInput
              style={styles.input}
              placeholder="Delivery Address"
              value={address}
              onChangeText={setAddress}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>
        <View>
          <CustomButton
            text="Complete Order"
            onPress={handleCompleteOrder}
            color="#4682b4"
            width="100%"
            height={45}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 10,
    paddingBottom: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  section: {
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  input: {
    height: 40,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  button: {
    marginTop: 20,
    alignSelf: 'center',
  },
  capacityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
  },
  capacityButton: {
    backgroundColor: '#4682b4',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 5,
    marginLeft: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OrderScreen;