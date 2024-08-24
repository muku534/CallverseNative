/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ScrollView, StyleSheet, ToastAndroid } from 'react-native';
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
import { EmailSignin } from '../../config/EmailSignup';

const Login = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [loding, setLoding] = useState(false);
    const [linkLoading, setLinkLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');


    const handleSignin = async () => {
        if (!email || !password) {
            ToastAndroid.show('Please enter email and password', ToastAndroid.SHORT);
            return;
        }

        try {
            setLoading(true)
            const user = await EmailSignin({ email, password });
            if (user) {
                ToastAndroid.show('Signed in successfully!', ToastAndroid.SHORT);
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'TabStack' }],
                    })
                );
                setEmail('');
                setPassword('');
            } else {
                ToastAndroid.show('Invalid email or password', ToastAndroid.SHORT);
            }
            setLoading(false)
        } catch (error) {
            console.error('Signin Error:', error);
            ToastAndroid.show('Failed to signin . Please try again.', ToastAndroid.SHORT);
        } finally {
            setLoading(false)
        }
    }


    return (
        <SafeAreaView style={styles.container} >
            <ScrollView showsVerticalScrollIndicator={false}>
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
                        <View style={styles.inputContainer}>
                            <Text style={styles.lable}>Password</Text>
                            <View style={styles.TextInput}>
                                <TextInput
                                    // maxLength={10}
                                    placeholder="Enter your Password"
                                    placeholderTextColor={COLORS.darkgray1}
                                    keyboardType="visible-password"
                                    style={{ width: '100%', color: COLORS.darkgray1 }}
                                    value={password}
                                    onChangeText={text => setPassword(text)}
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
                            onPress={handleSignin}
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
        justifyContent: 'center',
        // marginHorizontal: wp(2),
        // height: '30%',
    },
    image: {
        width: '100%',
        height: hp(37.5),
        // marginVertical: hp(2),
    },
    contentContainer: {
        flex: 1,
        marginHorizontal: wp(3),
        // justifyContent: 'space-between',
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
        // marginBottom: 12,
    },
    lable: {
        color: COLORS.black,
        fontSize: hp(2),
        fontWeight: '400',
        marginTop: hp(1.5),
        marginBottom: hp(1),
    },
    TextInput: {
        width: '100%',
        height: hp(6),
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
