import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import config from '../config';

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
      // Update item availability only if it's an art
      if (itemType.toLowerCase() === 'art') {
        await fetch(`${config.API_BASE_URL}/api/${itemType.toLowerCase()}s/${itemId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isAvailable: false }),
        });
      }

      // Update user's purchased or booked items .
      await fetch(`${config.API_BASE_URL}/api/users/complete-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, itemId, itemType, seats }), // Include seats in the request
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

  const price = itemDetails.price * (itemType.toLowerCase() === 'event' ? seats : 1); // Update price based on seats for events
  const deliveryFee = price * 0.05;
  const tax = price * 0.13;
  const totalPrice = price + deliveryFee + tax;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header navigation={navigation} showBackButton={true} />
      <View style={styles.container}>
        <Text style={styles.header}>Order Details</Text>
        <Text>Title: {itemDetails.title}</Text>
        <Text>Type: {itemType}</Text>
        <Text>Artist: {artistName}</Text>
        {itemType.toLowerCase() === 'event' && (
          <>
            <Text>Date: {new Date(itemDetails.date).toLocaleDateString()}</Text>
            <Text>Time: {itemDetails.time}</Text>
            <Text style={styles.subHeader}>Select Number of Seats</Text>
            <Picker
              selectedValue={seats}
              onValueChange={(value) => setSeats(value)}
              style={styles.picker}
            >
              {[...Array(itemDetails.venueCapacity).keys()].map((_, index) => (
                <Picker.Item key={index} label={`${index + 1}`} value={index + 1} />
              ))}
            </Picker>
          </>
        )}

        <Text style={styles.header}>Pricing</Text>
        <Text>Price: ${price.toFixed(2)}</Text>
        <Text>Delivery Fee: ${deliveryFee.toFixed(2)}</Text>
        <Text>Tax: ${tax.toFixed(2)}</Text>
        <Text>Total: ${totalPrice.toFixed(2)}</Text>

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

        <Button title="Complete Order" onPress={handleCompleteOrder} />
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
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 12,
  },
});

export default OrderScreen;