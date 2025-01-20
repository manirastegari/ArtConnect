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

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ArtDetails" component={ArtDetailsScreen} />
          <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
          <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
          <Stack.Screen name="PostArt" component={PostArtScreen} options={{ headerShown: false }} />
          <Stack.Screen name="PostEvent" component={PostEventScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}