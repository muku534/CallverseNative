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
import { useDispatch, useSelector } from 'react-redux';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchChats, fetchContacts, loginUser } from '../../redux/action';
import firestore from '@react-native-firebase/firestore';

const SplashScreen = ({ navigation }) => {

    const dispatch = useDispatch();
    const userData = useSelector(state => state.userData)
    console.log("redux user data", userData)

    const fetchUserData = async (userId) => {
        try {
            // Check if user data is cached in AsyncStorage
            const cachedUserData = await AsyncStorage.getItem('userData');
            if (cachedUserData) {
                const userData = JSON.parse(cachedUserData);
                console.log('User data fetched from cache:', userData.randomNumber);
                dispatch(loginUser(userData));
                await getContacts(userId)
                return userData;
            }

            // If no cached data, fetch from Firestore
            const userDoc = await firestore().collection('Users').doc(userId).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                console.log('User data fetched from Firestore:', userData.randomNumber);

                // Cache the data locally
                await AsyncStorage.setItem('userData', JSON.stringify(userData));
                dispatch(loginUser(userData));
                return userData;
            } else {
                console.error('User data not found in Firestore');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const getContacts = async (userId) => {
        try {
            if (!userId) {
                console.error('No userData found');
                return;
            }

            const contactsRef = firestore().collection('Contacts').doc(userId);
            const doc = await contactsRef.get();

            if (doc.exists) {
                const contacts = doc.data().contacts;
                dispatch(fetchContacts(contacts));
                console.log('Contacts fetched:', contacts);
                await getChats(userId)
            } else {
                console.error('Contacts not found');
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    };

    const getChats = async (userId) => {
        try {
            if (!userId) {
                console.error('No userData found');
                return;
            }

            const chatsRef = firestore().collection('chatRooms').doc(userId);
            const doc = await chatsRef.get();
            if (doc.exists) {
                const chats = doc.data().chats;
                dispatch(fetchChats(chats));
                console.log('Chats fetched:', chats);
            } else {
                console.error('Chats not found');
            }
        } catch (error) {
            console.error('Error fetching Chats:', error);
        }
    };


    useEffect(() => {
        const checkAuthAndFetchProducts = async () => {
            try {
                const currentUser = auth().currentUser;
                if (currentUser) {
                    const userId = currentUser.uid;
                    console.log('Authenticated user ID:', userId);

                    // Fetch user data from Firestore or cache
                    await fetchUserData(userId);

                    // // Navigate to the home screen or other protected screens
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: 'TabStack' }],
                        })
                    );
                } else {
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: 'Welcome' }],
                        })
                    ); // Navigate to the welcome screen if not authenticated
                }
            } catch (error) {
                console.error('Error during authentication check and data fetch:', error);
            }
        };

        const timer = setTimeout(() => {
            checkAuthAndFetchProducts();
        }, 2000);

        return () => clearTimeout(timer);
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
