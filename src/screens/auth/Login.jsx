/* eslint-disable prettier/prettier */
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ToastAndroid, ScrollView, StyleSheet } from 'react-native';
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
import { fetchChats, fetchContacts, loginUser } from '../../redux/action';
import { useDispatch } from 'react-redux';

const Login = ({ navigation }) => {
    const dispatch = useDispatch();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loadingState, setLoadingState] = useState({ loading: false });

    const handleInputChange = useCallback((field, value) => {
        setCredentials(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleSignin = useCallback(async () => {
        const { email, password } = credentials;
        if (!email || !password) {
            ToastAndroid.show('Please enter email and password', ToastAndroid.SHORT);
            return;
        }

        try {
            setLoadingState({ loading: true });
            const user = await EmailSignin({ email, password });
            if (user) {
                ToastAndroid.show('Signed in successfully!', ToastAndroid.SHORT);
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'TabStack' }],
                    })
                );
                await fetchUserData(user.uid);
                setCredentials({ email: '', password: '' });
            } else {
                ToastAndroid.show('Invalid email or password', ToastAndroid.SHORT);
            }
        } catch (error) {
            console.error('Signin Error:', error);
            ToastAndroid.show('Failed to sign in. Please try again.', ToastAndroid.SHORT);
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
                await AsyncStorage.setItem('userData', JSON.stringify(userData));
                dispatch(loginUser(userData));
                await getContacts(userId);
                await getChats(userId);
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
                dispatch(fetchContacts(contacts));
                console.log('Contacts fetched:', contacts);
            } else {
                console.error('Contacts not found');
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    }, []);

    const getChats = useCallback(async (userId) => {
        try {
            const chatsRef = firestore().collection('chatRooms');
            const snapshot = await chatsRef.where('users', 'array-contains', userId).get();

            if (!snapshot.empty) {
                const chats = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const otherUserId = data.users.find(id => id !== userId);
                    return { id: doc.id, ...data, otherUserId };
                });

                dispatch(fetchChats(chats));
                console.log('Chats fetched:', chats);
            } else {
                console.error('No chats found for this user');
            }
        } catch (error) {
            console.error('Error fetching chats:', error);
        }
    }, []);

    return (
        <SafeAreaView style={styles.container}>
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
                            label="Phone / Email"
                            placeholder="Enter your Phone or Email"
                            value={credentials.email}
                            onChangeText={text => handleInputChange('email', text)}
                        />
                        <InputField
                            label="Password"
                            placeholder="Enter your Password"
                            value={credentials.password}
                            onChangeText={text => handleInputChange('password', text)}
                        />
                        <Button
                            title="Login"
                            onPress={handleSignin}
                            loading={loadingState.loading}
                            style={styles.Button}
                        />
                    </View>
                    <Divider />
                    <LinkText navigation={navigation} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const InputField = ({ label, placeholder, value, onChangeText }) => (
    <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.textInput}>
            <TextInput
                placeholder={placeholder}
                placeholderTextColor={COLORS.darkgray1}
                style={styles.inputText}
                value={value}
                onChangeText={onChangeText}
            />
        </View>
    </View>
);

const Divider = () => (
    <View style={styles.lineText}>
        <View style={styles.line} />
        <Text style={styles.text}>or</Text>
        <View style={styles.line} />
    </View>
);

const LinkText = ({ navigation }) => (
    <View style={styles.linkContainer}>
        <Text style={styles.linkText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Welcome')} style={styles.linkButton}>
            <Text style={styles.link}>Generate New Number</Text>
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
    },
    welcomeContainer: {
        marginVertical: hp(1),
    },
    welcomeText: {
        fontSize: hp(4),
        fontFamily: fontFamily.FONTS.bold,
        fontWeight: '700',
        marginTop: hp(2),
        color: COLORS.black,
    },
    welcomeText2: {
        fontSize: hp(2.2),
        color: COLORS.darkgray1,
        fontFamily: fontFamily.FONTS.regular,
    },
    inputContainer: {
        marginBottom: hp(1),
    },
    label: {
        color: COLORS.black,
        fontSize: hp(2),
        marginBottom: hp(1),
    },
    textInput: {
        width: '100%',
        height: hp(6),
        borderColor: COLORS.secondaryGray,
        borderWidth: 0.5,
        borderRadius: wp(2),
        paddingLeft: wp(2),
        justifyContent: 'center',
    },
    inputText: {
        width: '100%',
        color: COLORS.darkgray1,
    },
    Button: {
        marginTop: hp(3.5),
        marginBottom: hp(1),
    },
    linkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: hp(5),
    },
    linkText: {
        fontSize: hp(2.2),
        color: COLORS.black,
    },
    linkButton: {
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    link: {
        color: '#037f51',
        fontSize: hp(2),
        fontFamily: fontFamily.FONTS.Medium,
        fontWeight: 'bold',
    },
    lineText: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: wp(5),
        marginTop: hp(2.4),
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: 'black',
    },
    text: {
        width: wp(10),
        fontSize: hp(2.2),
        color: COLORS.black,
        textAlign: 'center',
    },
});

export default Login;
