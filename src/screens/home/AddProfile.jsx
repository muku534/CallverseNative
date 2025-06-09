/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import { View, Text, Pressable, Image, Alert, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput, ToastAndroid, StatusBar } from 'react-native';
import React, { useEffect, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import COLORS from '../../../constants/colors';
import { FONTS, SIZES, images } from '../../../constants';
import Button from '../../Components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from '../../Components/Pixel/Index';
import AntDesign from 'react-native-vector-icons/AntDesign';
import fontFamily from '../../../constants/fontFamily';
import ImagePicker from 'react-native-image-crop-picker';
import { EmailSignup } from '../../config/EmailSignup';
import { CommonActions } from '@react-navigation/native';

const AddProfile = ({ route, navigation }) => {
    const randomNumber = route.params.randomNumber;
    console.log(randomNumber);
    const [userData, setUserData] = useState(null);
    const [showMenu, setShowMenu] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [viewProfileModalVisible, setViewProfileModalVisible] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState(randomNumber);
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem('userData');
                if (jsonValue !== null) {
                    const UserData = JSON.parse(jsonValue);
                    // setUserData(UserData);
                    setPhoneNumber(String(UserData));
                    console.log('Retrieved user data from AsyncStorage:', UserData);
                }
            } catch (error) {
                console.error('Error retrieving user data from AsyncStorage:', error);
            }
        };

        fetchData();
    }, []);

    const toggleMenu = () => {
        setShowMenu(!showMenu);
    };

    const handleMenuOption = async (option) => {
        if (option === 'viewProfile') {
            setViewProfileModalVisible(true);
        } else if (option === 'removeProfile') {
            setSelectedImage(null);
        } else if (option === 'changeProfile') {
            ImagePicker.openPicker({
                width: 300,
                height: 400,
                cropping: true,
            }).then(image => {
                console.log(image);
                setSelectedImage(image.path);
            });
        }
        toggleMenu();
    };

    const handleSignup = async () => {
        if (!email || !password || !name) {
            ToastAndroid.show('Please enter email and password', ToastAndroid.SHORT);
            return;
        }

        try {
            setLoading(true)
            const user = await EmailSignup({ email, password, name, randomNumber, selectedImage })
            if (user) {
                ToastAndroid.show('User created successfully', ToastAndroid.SHORT);
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'TabStack' }],
                    })
                );
            } else {
                ToastAndroid.show('Failed to create user', ToastAndroid.SHORT);
            }
        } catch (error) {
            console.error('Error signing up', error);
            ToastAndroid.show('Failed to create user', ToastAndroid.SHORT);
        } finally {
            setLoading(false)
        }

    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.WhiteSmoke }}>
            <StatusBar backgroundColor={COLORS.WhiteSmoke} barStyle="dark-content" />
            <ScrollView>
                <View style={styles.container}>
                    <Text style={{
                        marginTop: hp(2),
                        paddingHorizontal: wp(2),
                        // fontWeight: '400',
                        // marginVertical: ,
                        fontFamily: fontFamily.FONTS.Medium,
                        fontSize: hp(2.5),
                        color: COLORS.darkgray,
                    }}>
                        Complete your profile
                    </Text>
                    <Text style={{
                        paddingHorizontal: wp(2),
                        // fontWeight: '400',
                        marginVertical: hp(1.5),
                        fontFamily: fontFamily.FONTS.regular,
                        fontSize: hp(2),
                        color: COLORS.darkgray,
                    }}>Add a profile photo, name and bio to let people know who you are </Text>
                    <TouchableOpacity onPress={toggleMenu}>
                        <View
                            style={{
                                width: wp(35),
                                height: wp(35),
                                marginVertical: hp(1),
                                borderRadius: wp(35),
                                backgroundColor: COLORS.white,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderWidth: 1,
                                borderColor: COLORS.tertiaryWhite,
                            }}
                        >
                            {selectedImage ? (
                                <Image source={{ uri: selectedImage }} style={{ width: wp(34), height: wp(34), borderRadius: wp(34) }} />
                            ) : (
                                <>
                                    <AntDesign name="user" size={hp(7)} color={COLORS.darkgray} />
                                    <View
                                        style={{
                                            position: 'absolute',
                                            bottom: hp(1),
                                            right: 0,
                                        }}
                                    >
                                        <AntDesign name="pluscircle" size={hp(4)} color={COLORS.gray} />
                                    </View>
                                </>
                            )}
                        </View>
                    </TouchableOpacity>

                    {/* Modal to view profile image */}
                    <Modal visible={viewProfileModalVisible} transparent animationType="none">
                        <TouchableOpacity
                            style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                            onPress={() => setViewProfileModalVisible(false)}
                        >
                            <View style={{ backgroundColor: COLORS.white, borderRadius: wp(1), padding: hp(0.4), width: wp(80), height: hp(40) }}>
                                {selectedImage ? (
                                    <Image source={{ uri: selectedImage }} style={{ width: '100%', height: '100%', borderRadius: wp(1) }} />
                                ) : (
                                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontSize: hp(2.2), color: COLORS.black, fontFamily: fontFamily.FONTS.Medium }}>No profile image selected</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    </Modal>

                    <Modal visible={showMenu} transparent animationType="fade">
                        <TouchableOpacity
                            style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                            onPress={toggleMenu}
                        >
                            <View style={{
                                backgroundColor: COLORS.white, borderRadius: wp(2), padding: wp(4), width: wp(60),
                                height: hp(20), justifyContent: 'center',
                            }}>
                                <TouchableOpacity style={{ paddingVertical: hp(1) }} onPress={() => handleMenuOption('viewProfile')}>
                                    <Text style={{ fontFamily: fontFamily.FONTS.regular, fontSize: hp(2), color: COLORS.darkgray1 }} >View Profile</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ paddingVertical: hp(1) }} onPress={() => handleMenuOption('removeProfile')}>
                                    <Text style={{ fontFamily: fontFamily.FONTS.regular, fontSize: hp(2), color: COLORS.darkgray1 }}>Remove Profile</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ paddingVertical: hp(1) }} onPress={() => handleMenuOption('changeProfile')}>
                                    <Text style={{ fontFamily: fontFamily.FONTS.regular, fontSize: hp(2), color: COLORS.darkgray1 }} >Change Profile</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </Modal>

                    <View style={styles.formContainer}>
                        <Text style={styles.lable}>Phone Number</Text>
                        <View style={[styles.inputContainer, {
                            paddingHorizontal: wp(4),
                            color: COLORS.darkgray, borderRadius: wp(2), justifyContent: 'center', backgroundColor: COLORS.gray,
                        }]}>
                            <Text style={{ color: COLORS.darkgray, fontFamily: fontFamily.FONTS.regular, fontSize: hp(1.9) }}>{phoneNumber}</Text>
                        </View>

                        <Text style={styles.lable}>Display name</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                placeholder="Enter Your name"
                                placeholderTextColor={COLORS.secondaryGray}
                                keyboardType="default"
                                style={styles.textInput}
                                onChangeText={(text) => setName(text)}
                            />
                        </View>

                        <Text style={styles.lable}>Email </Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                placeholder="xyz@gmail.com"
                                placeholderTextColor={COLORS.secondaryGray}
                                keyboardType="email-address"
                                style={styles.textInput}
                                onChangeText={(text) => setEmail(text)}
                            />
                        </View>

                        <Text style={styles.lable}>password</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                placeholder="enter your password"
                                placeholderTextColor={COLORS.secondaryGray}
                                keyboardType="visible-password"
                                style={styles.textInput}
                                onChangeText={(text) => setPassword(text)}
                            />
                        </View>

                        <Button
                            title="Signup"
                            onPress={handleSignup}
                            style={{ marginVertical: hp(4) }}
                            loading={loading}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        alignItems: 'center',
        marginVertical: hp(4),
    },
    formContainer: {
        width: '100%',
        paddingHorizontal: wp(4),
    },
    lable: {
        fontSize: hp(1.9),
        fontFamily: fontFamily.FONTS.regular,
        color: COLORS.darkgray,
        marginVertical: hp(1),
    },
    inputContainer: {
        width: '100%',
        height: hp(6),
    },
    textInput: {
        width: '100%',
        height: hp(6),
        fontSize: hp(1.8),
        borderRadius: wp(2),
        backgroundColor: COLORS.white,
        paddingHorizontal: wp(4),
        color: COLORS.darkgray,
    },
});

export default AddProfile;
