/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '../../../constants';
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
import dynamicLinks from '@react-native-firebase/dynamic-links';
import messaging from '@react-native-firebase/messaging';

const Login = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [loding, setLoding] = useState(false);
    const [linkLoading, setLinkLoading] = useState(false);
    const [loading, setLoading] = useState(false);


    const sendEmailLink = async () => {
        setLoading(true);

        try {
            const userQuerySnapshot = await firestore().collection('Users').where('email', '==', email).get();

            if (userQuerySnapshot.empty) {
                Alert.alert('Error', 'This email does not exist.');
                setLoading(false);
                return;
            }

            const userData = userQuerySnapshot.docs[0].data();

            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            console.log('User data stored in AsyncStorage:', userData);

            await messaging().requestPermission();
            const fcmToken = await messaging().getToken();
            console.log('FCM Token:', fcmToken);

            if (!fcmToken || typeof fcmToken !== 'string') {
                console.error('Invalid FCM token:', fcmToken);
                setLoading(false);
                return;
            }

            userData.fcmToken = fcmToken;
            await firestore().collection('Users').doc(String(userData.randomNumber)).update({ fcmToken });

            console.log('FCM Token stored in user data:', userData);

            const actionCodeSettings = {
                url: 'https://callverse.com/Login?cartId=1234',
                handleCodeInApp: true,
                android: {
                    packageName: 'com.callverse.android',
                    installApp: true,
                    minimumVersion: '12',
                },
                dynamicLinkDomain: 'callverse1.page.link',
            };

            await auth().sendSignInLinkToEmail(email, actionCodeSettings);
            await AsyncStorage.setItem('emailForSignIn', email);
            Alert.alert('Success', 'Sign-in link sent to your email.');
        } catch (error) {
            console.error('Error sending sign-in link:', error);
            Alert.alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        messaging().requestPermission()
            .then(() => console.log('Notification permission granted.'))
            .catch(error => console.log('Notification permission not granted:', error));

        messaging().onMessage(async remoteMessage => {
            console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
            PushNotification.localNotification({
                title: remoteMessage.notification.title,
                message: remoteMessage.notification.body,
            });
        });

        const handleDynamicLink = link => {
            if (auth().isSignInWithEmailLink(link.url)) {
                setLoading(true);
                AsyncStorage.getItem('emailForSignIn').then(email => {
                    if (email) {
                        auth().signInWithEmailLink(email, link.url)
                            .then(result => {
                                console.log('User signed in with email link', result);
                                navigation.navigate('TabStack');
                            })
                            .catch(error => console.error('Error signing in with email link', error))
                            .finally(() => setLoading(false));
                    } else {
                        console.error('Could not find email in local storage');
                        setLoading(false);
                    }
                });
            }
        };

        const unsubscribe = dynamicLinks().onLink(handleDynamicLink);

        return () => unsubscribe();
    }, []);


    return (
        <SafeAreaView style={styles.container} >
            <ScrollView>
                <View>
                    <View style={styles.imageContainer}>
                        <Image source={require('../../../assets/image/9233852_4112338.jpg')}
                            style={styles.image} />
                    </View>
                    <View style={styles.contentContainer}>
                        <View style={styles.welcomeContainer}>
                            <Text style={styles.welcomeText}>Hi Welcome Back! 👋</Text>
                            <Text style={styles.welcomeText2}>Hello again, you have been missed!</Text>
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.lable}>Phone / Email</Text>
                            <View style={styles.TextInput}>
                                <TextInput
                                    // maxLength={10}
                                    placeholder="Enter your Phone or Email "
                                    placeholderTextColor={COLORS.darkgray1}
                                    keyboardType="email-address"
                                    style={{ width: '100%', color: COLORS.darkgray1 }}
                                    value={email}
                                    onChangeText={text => setEmail(text)}
                                />
                            </View>
                        </View>
                        {/** {showOtpInput && (
                            <View style={styles.inputContainer}>
                                <Text style={styles.lable}>OTP</Text>
                                <View style={styles.TextInput}>
                                    <TextInput
                                        maxLength={6}
                                        placeholder="Enter OTP"
                                        placeholderTextColor={COLORS.darkgray1}
                                        keyboardType="numeric"
                                        style={{ width: '100%', color: COLORS.darkgray1 }}
                                        value={otp}
                                        onChangeText={text => setOtp(text)}
                                    />
                                </View>
                            </View>
                        )} */}
                        <Button
                            title="Login"
                            onPress={sendEmailLink}
                            loding={loding || linkLoading}
                            style={styles.Button}
                        />

                    </View>
                    <View style={styles.lineText}>
                        <View style={styles.line} />
                        <Text style={styles.text}>or</Text>
                        <View style={styles.line} />
                    </View>
                    <View style={styles.linkContainer}>
                        <Text style={styles.linkText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Welcome')} style={styles.linkbutton}>
                            <Text style={styles.link}>Generate New Number</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        justifyContent: 'space-between',
    },
    imageContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'column',
        marginHorizontal: wp(2),
        height: '30%',
    },
    image: {
        width: '100%',
        height: hp(40),
        // marginVertical: hp(2),
    },
    contentContainer: {
        flex: 1,
        marginHorizontal: wp(3),
        // justifyContent: 'space-between',
    },
    welcomeContainer: {
        marginVertical: hp(2),
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
        // marginBottom: 12,
    },
    lable: {
        color: COLORS.black,
        fontSize: hp(2.2),
        fontWeight: '400',
        marginTop: hp(2.2),
        marginBottom: hp(1),
    },
    TextInput: {
        width: '100%',
        height: hp(6.2),
        borderColor: COLORS.secondaryGray,
        borderWidth: 0.5,
        borderRadius: wp(2),
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: wp(2),
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
    linkbutton: {
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
        marginTop: hp(6),
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
