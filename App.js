import React, { useRef, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import SplashScreen from './src/screens/auth/SplashScreen';
import Login from './src/screens/auth/Login';
import Welcome from './src/screens/auth/Welcome';
import AddProfile from './src/screens/home/AddProfile';
import { Provider } from 'react-redux';
import store from './src/redux/store';
import AddContact from './src/screens/home/AddContact';
import PersonalChats from './src/screens/home/PersonalChat';
import TabStack from './src/navigation/BottomNavigation';
import Contacts from './src/screens/home/contact';
import Profile from './src/screens/home/Profile';
import messaging from '@react-native-firebase/messaging';
import ArchivedChats from './src/screens/home/ArchivedChats';
import { createSharedElementStackNavigator } from 'react-navigation-shared-element';
import UserDetailScreen from './src/screens/home/UserDetailScreen';
import PushNotification from 'react-native-push-notification';
import EditProfile from './src/screens/home/EditProfile';
import CallingScreen from './src/screens/home/CallingScreen';

// Setup PushNotification
PushNotification.configure({
  // Called when Token is generated (iOS and Android)
  onRegister: function (token) {
    console.log('TOKEN:', token);
  },

  // Called when a remote or local notification is opened or received
  onNotification: function (notification) {
    console.log('NOTIFICATION:', notification);

    // process the notification (display alert, navigate, etc.)
    // You can access notification data here
    if (notification.data && notification.data.chatId) {
      // Handle navigation or display logic
      navigationRef.current?.navigate('PersonalChats', { chatId: notification.data.chatId });
    }

    // Required on iOS only
    notification.finish(PushNotification.FetchResult.NoData);
  },

  // IOS only
  requestPermissions: Platform.OS === 'ios',
});

const Stack = createSharedElementStackNavigator();

function App() {

  const navigationRef = useRef(null);

  useEffect(() => {
    // Create the notification channel (for Android 8.0+)
    PushNotification.createChannel(
      {
        channelId: 'default-channel-id',
        channelName: 'Default Channel',
        channelDescription: 'A default channel for app notifications',
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`Channel created: ${created}`)
    );

    // Request notification permissions
    const requestPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Notification permission granted.');
      } else {
        console.log('Notification permission denied.');
      }
    };

    requestPermission();

    // Handle foreground notifications
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Foreground message received!', JSON.stringify(remoteMessage));

      PushNotification.localNotification({
        channelId: 'default-channel-id',
        title: remoteMessage.notification.title || 'New Message',
        message: remoteMessage.notification.body || 'You have a new message',
        data: remoteMessage.data,
      });
    });

    // Handle background notifications
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background message received!', JSON.stringify(remoteMessage));
    });

    // Handle initial notification when the app is opened from a quit state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage?.data?.chatId) {
          navigationRef.current?.navigate('PersonalChats', { chatId: remoteMessage.data.chatId });
        }
      });

    // Cleanup foreground handler
    return () => {
      unsubscribe();
    };
  }, []);

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
            <Stack.Screen name="UserDetail" component={UserDetailScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ArchivedChats" component={ArchivedChats} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
            <Stack.Screen name="AddProfile" component={AddProfile} options={{ headerShown: false }} />
            <Stack.Screen name="EditProfile" component={EditProfile} options={{ headerShown: false }} />
            <Stack.Screen name="AddContact" component={AddContact} options={{ headerShown: false }} />
            <Stack.Screen name="PersonalChats" component={PersonalChats} options={{ headerShown: false }} />
            <Stack.Screen name="CallingScreen" component={CallingScreen} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
