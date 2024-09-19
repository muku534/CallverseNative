import { StatusBar, StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import LottieView from 'lottie-react-native';
import auth from '@react-native-firebase/auth';
import { useDispatch, useSelector } from 'react-redux';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addChats, addContact, fetchChats, fetchContacts, loginUser } from '../../redux/action';
import firestore from '@react-native-firebase/firestore';
import Contacts from '../home/contact';
import { retrieveDataFromAsyncStorage, storeDataInAsyncStorage } from '../../utils/Helper';

const SplashScreen = ({ navigation }) => {

    const dispatch = useDispatch();

    const fetchUserData = async (userId) => {
        try {
            // Check if user data is cached in AsyncStorage
            const cachedUserData = retrieveDataFromAsyncStorage('userData');
            if (cachedUserData) {
                const userData = JSON.parse(cachedUserData);
                dispatch(loginUser(userData));
                return userData;
            }

            // If no cached data, fetch from Firestore
            const userDoc = await firestore().collection('Users').doc(userId).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                await storeDataInAsyncStorage('userData', userData);
                dispatch(loginUser(userData));
                return userData;
            } else {
                console.error('User data not found in Firestore');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const fetchContactsIfNeeded = async (userId) => {
        try {
            const cachedContacts = await retrieveDataFromAsyncStorage('contacts');
            if (cachedContacts) {
                dispatch(fetchContacts(JSON.parse(cachedContacts)));
                console.log('cachedContacts', cachedContacts);
            } else {
                const contactsRef = firestore().collection('Contacts').doc(userId);
                const doc = await contactsRef.get();
                if (doc.exists) {
                    const contacts = doc.data().contacts;
                    await storeDataInAsyncStorage('contacts', contacts);
                    dispatch(fetchContacts(contacts));
                    console.log('contacts fetch from firestore', contacts);

                } else {
                    console.log('No contacts found');
                }
            }
        } catch (error) {
            console.log('Error fetching contacts:', error);
        }
    }

    const fetchChatsIfNeeded = async (userId) => {
        try {
            const cachedChats = await retrieveDataFromAsyncStorage('chats');
            if (cachedChats) {
                dispatch(fetchChats(JSON.parse(cachedChats)));
                console.log('cachedContacts', cachedChats);

            } else {
                const chatsRef = firestore().collection('chatRooms').where('users', 'array-contains', userId);
                const snapShot = await chatsRef.get();
                if (!snapShot.empty) {
                    const chats = snapShot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    await storeDataInAsyncStorage('chats', chats);
                    dispatch(fetchChats(chats))
                    console.log('contacts fetch from firestore', chats);
                } else {
                    console.log('No chats found');
                }
            }
        } catch (error) {
            console.log('Error fetching chats:', error);
        }
    };

    const subscribeToFirestoreUpdates = (userId) => {
        const contactsRef = firestore().collection('Contacts').doc(userId);
        const chatsRef = firestore().collection('chatRooms').where('users', 'array-contains', userId);

        // Real-time updates for contacts
        const unsubscribeContacts = contactsRef.onSnapshot(async (doc) => {
            if (doc.exists) {
                const updatedContacts = doc.data().contacts;
                await storeDataInAsyncStorage('contacts', updatedContacts);
                dispatch(addContact(updatedContacts));
            }
        });

        // Real-time updates for chats
        const unsubscribeChats = chatsRef.onSnapshot(async (snapshot) => {
            if (!snapshot.empty) {
                const updatedChats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                await storeDataInAsyncStorage('chats', updatedChats);
                dispatch(addChats(updatedChats));
            }
        });

        return () => {
            unsubscribeContacts(); // Unsubscribe when component unmounts
            unsubscribeChats();
        };
    };

    useEffect(() => {
        const initializeApp = async () => {
            try {
                const currentUser = auth().currentUser;
                if (currentUser) {
                    const userId = currentUser.uid;
                    // Fetch user data, contacts, and chats if needed
                    await Promise.all([fetchUserData(userId), fetchContactsIfNeeded(userId), fetchChatsIfNeeded(userId)]);

                    // Set up real-time listeners for updates
                    const unsubscribe = subscribeToFirestoreUpdates(userId);

                    // // Navigate to the home screen or other protected screens
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: 'TabStack' }],
                        })
                    );
                    return unsubscribe; // Unsubscribe listeners on unmount
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

        // Wait 2 seconds before starting the app
        const timer = setTimeout(() => {
            initializeApp();
        }, 1000);

        return () => clearTimeout(timer); // Cleanup timer
    }, [navigation]);

    return (
        <>
            <StatusBar backgroundColor={'#f2f2f2'} barStyle="dark-content" />
            <LottieView
                source={require('../../../assets/image/Animation - 1706440302011.json')}
                autoPlay
                loop={true}
                style={{ width: '100%', height: '100%' }} // Add this line
            />
        </>
    )
}

export default SplashScreen;

const styles = StyleSheet.create({});
