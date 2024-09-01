/**
 * @format
 */

import { register } from '@videosdk.live/react-native-sdk';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';

// Foreground notifications
messaging().onMessage(async remoteMessage => {
    console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));

    const { notification } = remoteMessage;
    if (notification) {
        const { title, body } = notification;

        // Display a local notification
        PushNotification.localNotification({
            title: title || 'No Title',
            message: body || 'No Body',
            // You can add other options here
        });
    }
});

// Set the background message handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background Message received:', remoteMessage);

    const { notification } = remoteMessage;
    if (notification) {
        const { title, body } = notification;

        // Display a local notification
        PushNotification.localNotification({
            title: title || 'No Title',
            message: body || 'No Body',
            // You can add other options here
        });
    }
});

register();

AppRegistry.registerComponent(appName, () => App);
