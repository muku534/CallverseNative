/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';

// Foreground notification handler
messaging().onMessage(async remoteMessage => {
    console.log('Foreground message received:', JSON.stringify(remoteMessage));
    const { notification } = remoteMessage;

    if (notification) {
        const { title, body } = notification;
        PushNotification.localNotification({
            channelId: 'default-channel-id', // Ensure the channelId matches the one created in App.js
            title: title || 'Notification Title',
            message: body || 'Notification Body',
        });
    }
});

// Background notification handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background message received:', JSON.stringify(remoteMessage));
    const { notification } = remoteMessage;

    if (notification) {
        const { title, body } = notification;
        PushNotification.localNotification({
            channelId: 'default-channel-id',
            title: title || 'Notification Title',
            message: body || 'Notification Body',
        });
    }
});


AppRegistry.registerComponent(appName, () => App);
