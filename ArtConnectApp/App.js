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

// Import App Center modules
// import AppCenter from 'appcenter';
// import AppCenterAnalytics from 'appcenter-analytics';
// import AppCenterCrashes from 'appcenter-crashes';

// console.log('AppCenter:', AppCenter);

// // Initialize App Center
// AppCenter.start("568d8f1e-876f-465f-b6d5-1de31a00b810", AppCenterAnalytics, AppCenterCrashes);

const Stack = createStackNavigator();

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
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );

}