import React, { useState, useEffect, useContext } from 'react';
import { View, TextInput, Text, StyleSheet, Alert, Image, ScrollView, Platform, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import CustomButton from '../components/CustomButton';
import { AuthContext } from '../AuthContext';
import Header from '../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import config from '../config';

const PostArtScreen = ({ navigation }) => {
    const { userId } = useContext(AuthContext);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [images, setImages] = useState([]);
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        const requestPermissions = async () => {
            if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permissions Required', 'Camera permissions are required to continue.');
                }
            }
        };

        requestPermissions();
    }, []);

    const selectImage = async () => {
        const remainingSlots = 3 - images.length;
        if (remainingSlots <= 0) {
            Alert.alert('Limit Reached', 'You can only select up to 3 images.');
            return;
        }

        Alert.alert(
            'Select Image',
            'Choose an option',
            [
                {
                    text: 'Camera',
                    onPress: async () => {
                        const result = await ImagePicker.launchCameraAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsMultipleSelection: true,
                            quality: 1,
                        });
                        if (!result.canceled) {
                            const newImages = result.assets.slice(0, remainingSlots).map(asset => asset.uri);
                            setImages(prevImages => [...prevImages, ...newImages]);
                        }
                    },
                },
                {
                    text: 'Gallery',
                    onPress: async () => {
                        const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsMultipleSelection: true,
                            quality: 1,
                        });
                        if (!result.canceled) {
                            const newImages = result.assets.slice(0, remainingSlots).map(asset => asset.uri);
                            setImages(prevImages => [...prevImages, ...newImages]);
                        }
                    },
                },
                { text: 'Cancel', style: 'cancel' },
            ],
            { cancelable: true }
        );
    };

    const handleRemoveImage = (index) => {
        setImages(prevImages => prevImages.filter((_, i) => i !== index));
    };

    const handlePostArt = async () => {
        try {
            console.log('User ID:', userId);
            
            const formData = new FormData();
            formData.append('title', title);
            formData.append('category', category);
            formData.append('price', parseFloat(price));
            formData.append('description', description);
            formData.append('artistID', userId);

            images.forEach((imageUri, index) => {
                formData.append('images', {
                    uri: imageUri,
                    type: 'image/jpeg',
                    name: `image${index}.jpg`
                });
            });

            const response = await fetch(`${config.API_BASE_URL}/api/arts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            const contentType = response.headers.get('content-type');
            let data;
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                throw new Error(`Unexpected response format: ${text}`);
            }

            if (response.ok) {
                Alert.alert('Success', 'Art posted successfully');
                navigation.navigate('Home', { screen: 'Arts', params: { refresh: true } });
            } else {
                Alert.alert('Error', data.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Post art error:', error);
            Alert.alert('Error', 'Something went wrong. Please try again later.');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Header navigation={navigation} showBackButton={true} />
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
                <Text style={styles.title}>Post Art</Text>
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
                <CustomButton
                    text="Select Images"
                    onPress={selectImage}
                    color="#4682b4"
                    width="100%"
                    disabled={images.length >= 3}
                />
                <View style={styles.imageContainer}>
                    {images.map((image, index) => (
                        <View key={index} style={styles.imageWrapper}>
                            <Image source={{ uri: image }} style={styles.image} />
                            <TouchableOpacity onPress={() => handleRemoveImage(index)} style={styles.removeButton}>
                                <Text style={styles.removeButtonText}>Remove</Text>
                            </TouchableOpacity>
                        </View>
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
            </ScrollView>
            <View style={styles.postButtonContainer}>
                <CustomButton
                    text="Post Art"
                    onPress={handlePostArt}
                    color="#228B22"
                    width="100%"
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff'
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
        borderRadius: 5,
    },
    imageContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginVertical: 10,
    },
    imageWrapper: {
        position: 'relative',
        margin: 4,
    },
    image: {
        width: 170,
        height: 150,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
    },
    removeButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'red',
        padding: 5,
        borderRadius: 5,
    },
    removeButtonText: {
        color: '#fff',
        fontSize: 12,
    },
    postButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: '#fff',
    },
});

export default PostArtScreen;