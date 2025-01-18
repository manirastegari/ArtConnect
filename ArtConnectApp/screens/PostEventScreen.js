import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

const PostEventScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState([]);
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const selectImage = () => {
    launchImageLibrary({ mediaType: 'photo', selectionLimit: 3 }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        setImages(response.assets.map(asset => asset.uri));
      }
    });
  };

  const handlePostEvent = async () => {
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('price', parseFloat(price));
      formData.append('description', description);
      formData.append('date', new Date(date));
      formData.append('time', time);
      formData.append('artistID', 'artist-id-placeholder'); // Replace with actual artist ID

      images.forEach((imageUri, index) => {
        formData.append('images', {
          uri: imageUri,
          type: 'image/jpeg', // or 'image/png'
          name: `image${index}.jpg`
        });
      });

      const response = await fetch('http://192.168.2.27:5001/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Event posted successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (error) {
      console.error('Post event error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Post Event</Text>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
      />
      <Button title="Select Images" onPress={selectImage} />
      <View style={styles.imageContainer}>
        {images.map((image, index) => (
          <Image key={index} source={{ uri: image }} style={styles.image} />
        ))}
      </View>
      <TextInput
        style={styles.input}
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Date (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Time (HH:MM)"
        value={time}
        onChangeText={setTime}
      />
      <Button title="Post Event" onPress={handlePostEvent} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginHorizontal: 5,
  },
});

export default PostEventScreen;