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
                try {
                    dispatch(fetchContacts(cachedContacts));
                    console.log('cachedContacts', cachedContacts);
                    return cachedContacts;
                } catch (parseError) {
                    console.error('Error parsing contacts data from AsyncStorage:', parseError);
                    await storeDataInAsyncStorage('contacts', []); // Clear corrupted data
                }
            }

            const contactsRef = firestore().collection('Contacts').doc(userId);
            const doc = await contactsRef.get();
            if (doc.exists) {
                const contacts = doc.data().contacts;
                await storeDataInAsyncStorage('contacts', contacts);
                dispatch(fetchContacts(contacts));
            } else {
                console.log('No contacts found');
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
                    dispatch(fetchChats(cachedChats));
                    console.log('cachedChats', cachedChats);
                    return cachedChats;
                } catch (parseError) {
                    console.error('Error parsing chatRooms data from AsyncStorage:', parseError);
                    await storeDataInAsyncStorage('chatRooms', []); // Clear corrupted data
                }
            }

            const chatsRef = firestore().collection('chatRooms').where('users', 'array-contains', userId).limit(10);
            const snapshot = await chatsRef.get();
            if (!snapshot.empty) {
                const otherUsersIds = new Set();

                const chats = snapshot.docs.map(doc => {
                    const chatRoomId = doc.id;
                    const { archived } = doc.data();

                    const ids = chatRoomId.split('_');
                    const otherUsersId = ids[0] === userId ? ids[1] : ids[0];
                    otherUsersIds.add(otherUsersId);

                    return { id: chatRoomId, otherUsersId, archived };
                });

                //Fetch the contact data  for the other users in the chat from the AsyncStorage
                const contacts = await retrieveDataFromAsyncStorage('contacts') || [];
                const contactIds = contacts.map(contact => contact.id);

                //separate users who are alredy in contact list
                const userToFetch = Array.from(otherUsersIds).filter(id => !contactIds.includes(id));
                const fetchedUsers = await fetchUsers(userToFetch);

                const allUsers = [...contacts, ...fetchedUsers];

                await storeDataInAsyncStorage('chatRooms', allUsers);
                dispatch(fetchChatsRoom({ chatRoom: allUsers }));
            } else {
                console.log('No chatRooms found');
            }
        } catch (error) {
            console.error('Error fetching chatRooms:', error);
        }
    };

    const fetchUsers = async (userIds) => {
        try {
            if (userIds.length === 0) return [];

            const usersRef = firestore().collection('Users');
            const usersPromises = userIds.map(async (id) => {
                const userDoc = await usersRef.doc(id).get();
                return userDoc.exists ? { id, ...userDoc.data() } : null;
            });

            const users = await Promise.all(usersPromises);
            return users.filter(user => user);
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    }

    const subscribeToFirestoreUpdates = (userId) => {
        const contactsRef = firestore().collection('Contacts').doc(userId);
        const chatsRef = firestore().collection('chatRooms').where('users', 'array-contains', userId);

        const unsubscribeContacts = contactsRef.onSnapshot(async (doc) => {
            if (doc.exists) {
                const updatedContacts = doc.data().contacts;
                await storeDataInAsyncStorage('contacts', updatedContacts);
                dispatch(addContact(updatedContacts));
            }
        });

        const unsubscribeChats = chatsRef.onSnapshot(async (snapshot) => {
            if (!snapshot.empty) {
                const updatedChats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                await storeDataInAsyncStorage('chats', updatedChats);
                dispatch(addChats(updatedChats));
            }
        });

        return () => {
            unsubscribeContacts();
            unsubscribeChats();
        };
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

                    const unsubscribe = subscribeToFirestoreUpdates(userId);

                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: 'TabStack' }],
                        })
                    );

                    return unsubscribe;
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
        }, 1000);

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
