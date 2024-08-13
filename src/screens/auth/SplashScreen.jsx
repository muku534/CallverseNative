/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import LottieView from 'lottie-react-native';
import auth from '@react-native-firebase/auth';

const SplashScreen = ({ navigation }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            if (auth().currentUser) {
                // If a user is signed in, navigate to 'HomeScreen'
                navigation.replace('TabStack');
            } else {
                // If no user is signed in, navigate to 'Login'
                navigation.replace('Welcome');
            }
        }, 900);

        return () => clearTimeout(timer); // This will clear the timeout if the component is unmounted before the time ends
    }, []);

    return (
        <LottieView
            source={require('../../../assets/image/Animation - 1706440302011.json')}
            autoPlay
            loop={true}
            style={{ width: '100%', height: '100%' }} // Add this line
        />
    )
}

export default SplashScreen;

const styles = StyleSheet.create({});
