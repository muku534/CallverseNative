/* eslint-disable prettier/prettier */
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ToastAndroid, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../../constants';
import Button from '../../Components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from '../../Components/Pixel/Index';
import fontFamily from '../../../constants/fontFamily';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { EmailSignin } from '../../config/EmailSignup';
import { CommonActions } from '@react-navigation/native';
import { fetchChats, fetchChatsRoom, fetchContacts, loginUser } from '../../redux/action';
import { useDispatch } from 'react-redux';
import messaging from '@react-native-firebase/messaging';
import { retrieveDataFromAsyncStorage, storeDataInAsyncStorage } from '../../utils/Helper';
import { storeUserInSQLite } from '../../services/sqliteHelpers';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Add this import

const Login = ({ navigation }) => {
    const dispatch = useDispatch();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loadingState, setLoadingState] = useState({ loading: false });


    const validateEmail = (email) => {
        // Basic email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleLoginError = (error) => {
        console.error('Signin Error:', error);
        let errorMessage = 'Failed to sign in. Please try again.';

        if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password. Please try again.';
        } else if (error.code === 'auth/user-not-found') {
            errorMessage = 'No user found with this email address.';
        }

        ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
    };

    const handleInputChange = useCallback((field, value) => {
        setCredentials(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleSignin = useCallback(async () => {
        const { email, password } = credentials;

        if (!email || !password) {
            ToastAndroid.show('Please enter email and password', ToastAndroid.SHORT);
            return;
        }

        if (!validateEmail(email)) {
            ToastAndroid.show('Please enter a valid email address', ToastAndroid.SHORT);
            return;
        }


        try {
            setLoadingState({ loading: true });
            // Request notification permissions
            await messaging().requestPermission();
            const fcmToken = await messaging().getToken();
            console.log('FCM Token:', fcmToken);

            const user = await EmailSignin({ email, password });
            if (user) {
                // await getChats(user.uid);
                await fetchUserData(user.uid);
                await getContacts(user.uid);
                await fetchChatsIfNeeded(user.uid);
                console.log("users login", user)

                ToastAndroid.show('Signed in successfully!', ToastAndroid.SHORT);
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'TabStack' }],
                    })
                );

                // Store FCM token in Firestore
                if (fcmToken) {
                    await firestore().collection('Users').doc(user.uid).update({ fcmToken });
                }
                setCredentials({ email: '', password: '' });
            } else {
                ToastAndroid.show('Invalid email or password', ToastAndroid.SHORT);
            }
        } catch (error) {
            handleLoginError(error);
        } finally {
            setLoadingState({ loading: false });
        }
    }, [credentials]);

    const fetchUserData = useCallback(async (userId) => {
        try {
            const userDoc = await firestore().collection('Users').doc(userId).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                console.log('User data fetched from Firestore:', userData.randomNumber);

                // Retrieve FCM token
                const fcmToken = await messaging().getToken();
                if (fcmToken) {
                    userData.fcmToken = fcmToken; // Add the token to userData
                    await firestore().collection('Users').doc(userId).update({ fcmToken });
                    console.log('FCM Token stored in user data:', fcmToken);
                } else {
                    console.error('Failed to retrieve FCM token');
                }

                await storeUserInSQLite(userData);
                dispatch(loginUser(userData));
            } else {
                console.error('User data not found in Firestore');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }, []);

    const getContacts = useCallback(async (userId) => {
        try {
            const contactsRef = firestore().collection('Contacts').doc(userId);
            const doc = await contactsRef.get();
            if (doc.exists) {
                const contacts = doc.data().contacts;
                await storeContactInSQLite(contacts);
                dispatch(fetchContacts(contacts));
            } else {
                console.error('Contacts not found');
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    }, []);

    const fetchChatsIfNeeded = async (userId) => {
        try {
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

                // Step 3: Identify users who need to be fetched from Firestore
                const userIdsToFetch = Array.from(otherUsersIds).filter(id => !contactIds.includes(id));

                // Step 4: Fetch user data for users not in the contact list
                const fetchedUsers = await fetchUsers(userIdsToFetch);

                const allUsers = [...contacts, ...fetchedUsers];

                await storeChatRoomInSQLite(allUsers);

                // Step 7: Merge user data with the chats data
                const chatsWithUserDetails = chats.map(chat => {
                    const otherUserData = allUsers.find(user => user.id === chat.otherUsersId);
                    return {
                        ...chat,
                        otherUser: otherUserData || null // Add user data or null if not found
                    };
                });

                // Step 8: Dispatch the final chat data with user details
                dispatch(fetchChatsRoom(chatsWithUserDetails));
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

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View>
                    <View style={styles.imageContainer}>
                        <Image source={require('../../../assets/image/9233852_4112338.jpg')} style={styles.image} />
                    </View>
                    <View style={styles.contentContainer}>
                        <View style={styles.welcomeContainer}>
                            <Text style={styles.welcomeText}>Hi Welcome Back! 👋</Text>
                            <Text style={styles.welcomeText2}>Hello again, you have been missed!</Text>
                        </View>
                        <InputField
                            icon="email-outline"
                            placeholder="max123@xyz.com"
                            value={credentials.email}
                            onChangeText={text => handleInputChange('email', text)}
                        />
                        <InputField
                            icon="lock-outline"
                            placeholder="Enter your Password"
                            secureTextEntry={true} // Hide password input
                            value={credentials.password}
                            onChangeText={text => handleInputChange('password', text)}
                        />
                        {/* Forgot Password */}
                        <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('ForgotPassword')}>
                            <Text style={styles.forgotPassword}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>

                    <Button
                        title="Login"
                        onPress={handleSignin}
                        loading={loadingState.loading}
                        style={styles.Button}
                    />
                    <LinkText navigation={navigation} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const InputField = ({ label, icon, placeholder, value, onChangeText }) => (
    <View style={styles.inputContainer}>
        {/* <Text style={styles.label}>{label}</Text> */}
        <View style={styles.textInput}>
            <Icon name={icon} size={22} color={COLORS.secondaryGray} style={styles.inputIcon} />
            <TextInput
                placeholder={placeholder}
                placeholderTextColor={COLORS.secondaryGray}
                style={styles.inputText}
                value={value}
                onChangeText={onChangeText}
            />
        </View>
    </View>
);

const LinkText = ({ navigation }) => (
    <View style={styles.linkContainer}>
        <Text style={styles.linkText}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Welcome')}>
            <Text style={styles.link}>Join Now</Text>
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        justifyContent: 'space-between',
    },
    imageContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: hp(37.5),
    },
    contentContainer: {
        flex: 1,
        marginHorizontal: wp(3),
        justifyContent: 'center',
    },
    welcomeContainer: {
        marginVertical: hp(1),
    },
    welcomeText: {
        fontSize: hp(3),
        fontFamily: fontFamily.FONTS.bold,
        marginTop: hp(2),
        color: COLORS.black,
    },
    welcomeText2: {
        fontSize: hp(2),
        color: COLORS.darkgray1,
        fontFamily: fontFamily.FONTS.regular,
    },
    inputContainer: {
        marginTop: hp(1),
        marginBottom: hp(1.5),
    },
    textInput: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: hp(6),
        borderColor: COLORS.gray,
        borderWidth: 1,
        borderRadius: wp(2),
        paddingLeft: wp(2),
        backgroundColor: COLORS.white,
    },
    inputIcon: {
        marginRight: wp(2),
    },
    inputText: {
        flex: 1,
        color: COLORS.darkgray1,
        fontSize: hp(2),
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        color: COLORS.primary,
        fontFamily: fontFamily.FONTS.Medium,
        fontSize: hp(1.9),
        marginVertical: hp(1)
    },
    Button: {
        marginHorizontal: wp(5),
        marginTop: hp(0.5),
        marginBottom: hp(2),
    },
    linkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: hp(0.5),
        marginBottom: hp(2),
    },
    linkText: {
        fontFamily: fontFamily.FONTS.Medium,
        fontSize: hp(2),
        color: COLORS.darkgray,
    },
    link: {
        fontSize: hp(2.2),
        color: COLORS.primary,
        fontFamily: fontFamily.FONTS.bold,
        marginLeft: wp(1),
    },
});

export default Login;
