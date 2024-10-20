
import { StatusBar, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import LottieView from 'lottie-react-native';
import auth from '@react-native-firebase/auth';
import { useDispatch } from 'react-redux';
import { CommonActions } from '@react-navigation/native';
import { storeDataInAsyncStorage, retrieveDataFromAsyncStorage } from '../../utils/Helper';
import { addChats, addContact, fetchChats, fetchChatsRoom, fetchContacts, loginUser } from '../../redux/action';
import firestore from '@react-native-firebase/firestore';

// SplashScreen Component
const SplashScreen = ({ navigation }) => {
    const dispatch = useDispatch();

    const fetchUserData = async (userId) => {
        try {
            const cachedUserData = await retrieveDataFromAsyncStorage('userData');
            if (cachedUserData) {
                try {
                    dispatch(loginUser(cachedUserData));
                    console.log('cachedUserData', cachedUserData);
                    return cachedUserData;
                } catch (parseError) {
                    console.error('Error parsing user data from AsyncStorage:', parseError);
                    await storeDataInAsyncStorage('userData', {}); // Clear corrupted data
                }
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const fetchContactsIfNeeded = async (userId) => {
        try {
            const cachedContacts = await retrieveDataFromAsyncStorage('contacts');
            if (cachedContacts) {
                try {
                    dispatch(fetchContacts(cachedContacts));
                    console.log('cachedContacts', cachedContacts);
                    return cachedContacts;
                } catch (parseError) {
                    console.error('Error parsing contacts data from AsyncStorage:', parseError);
                    await storeDataInAsyncStorage('contacts', []); // Clear corrupted data
                }
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    };

    const fetchChatsIfNeeded = async (userId) => {
        try {
            const cachedChats = await retrieveDataFromAsyncStorage('chatRooms');
            if (cachedChats) {
                try {
                    // Step 2: Dispatch cached chats to Redux if they exist
                    dispatch(fetchChatsRoom(cachedChats));
                    console.log('Using cached chats', cachedChats);
                    return cachedChats;
                } catch (error) {
                    console.error('Error using cached chatRooms data:', error);
                    await storeDataInAsyncStorage('chatRooms', []); // Clear corrupted data
                }
            }

        } catch (error) {
            console.error('Error fetching chatRooms:', error);
        }
    };

    useEffect(() => {
        const initializeApp = async () => {
            try {
                const currentUser = auth().currentUser;
                if (currentUser) {
                    const userId = currentUser.uid;
                    await Promise.all([
                        fetchUserData(userId),
                        fetchContactsIfNeeded(userId),
                        fetchChatsIfNeeded(userId),
                    ]);

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
                    );
                }
            } catch (error) {
                console.error('Error during authentication check and data fetch:', error);
            }
        };

        const timer = setTimeout(() => {
            initializeApp();
        }, 700);

        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <>
            <StatusBar backgroundColor='#f2f2f2' barStyle="dark-content" />
            <LottieView
                source={require('../../../assets/image/Animation - 1706440302011.json')}
                autoPlay
                loop
                style={styles.animation}
            />
        </>
    );
};

const styles = StyleSheet.create({
    animation: {
        width: '100%',
        height: '100%',
    },
});

export default SplashScreen;
