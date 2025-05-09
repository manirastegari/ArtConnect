import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './AuthContext';
import HomeScreen from './screens/HomeScreen';
import ArtDetailsScreen from './screens/ArtDetailsScreen';
import EventDetailsScreen from './screens/EventDetailsScreen';
import AuthScreen from './screens/AuthScreen';
import PostArtScreen from './screens/PostArtScreen';
import PostEventScreen from './screens/PostEventScreen';
import OrderScreen from './screens/OrderScreen';

const Stack = createStackNavigator();
// f8e5e616393d0f39f0175b830a1b0739a3373a8e
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ArtDetails" component={ArtDetailsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="EventDetails" component={EventDetailsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
          <Stack.Screen name="PostArt" component={PostArtScreen} options={{ headerShown: false }} />
          <Stack.Screen name="PostEvent" component={PostEventScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Order" component={OrderScreen} options={{ headerShown: false }} /> 
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}