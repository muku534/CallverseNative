import React, { useRef } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import SplashScreen from './src/screens/auth/SplashScreen';
import Login from './src/screens/auth/Login';
import Welcome from './src/screens/auth/Welcome';
import AddProfile from './src/screens/home/AddProfile';
import VoiceCall from './src/screens/home/VoiceCall'
import { Provider } from 'react-redux';
import store from './src/redux/store';
import AddContact from './src/screens/home/AddContact';
import PersonalChats from './src/screens/home/PersonalChat';
import TabStack from './src/navigation/BottomNavigation';
import Contacts from './src/screens/home/contact';
import Profile from './src/screens/home/Profile';

const Stack = createStackNavigator();

function App() {
  const navigationRef = useRef(null);
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator initialRouteName={SplashScreen}>
            <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
            <Stack.Screen name="TabStack" component={TabStack} options={{ headerShown: false }} />
            <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
            <Stack.Screen name="Contacts" component={Contacts} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
            <Stack.Screen name="AddProfile" component={AddProfile} options={{ headerShown: false }} />
            <Stack.Screen name="AddContact" component={AddContact} options={{ headerShown: true }} />
            <Stack.Screen name="PersonalChats" component={PersonalChats} options={{ headerShown: false }} />
            <Stack.Screen name="VoiceCall" component={VoiceCall} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
