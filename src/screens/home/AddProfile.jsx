/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import { View, Text, Pressable, Image, Alert, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
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
import ImageCropPicker from 'react-native-image-crop-picker';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import firestore from '@react-native-firebase/firestore';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';

const AddProfile = ({ route, navigation }) => {
    const randomNumber = route.params.randomNumber;
    console.log(randomNumber);
    const [userData, setUserData] = useState(null);
    const [showMenu, setShowMenu] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [viewProfileModalVisible, setViewProfileModalVisible] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [bio, setBio] = useState('');
    // const currentUserRandomNumber = '9649726428'; // replace this with the current user's random number
    const [phoneNumber, setPhoneNumber] = useState(randomNumber);

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

    const saveProfile = async () => {
        // Check if email already exists
        const usersRef = firestore().collection('Users');
        const snapshot = await usersRef.where('email', '==', email).get();
        if (!snapshot.empty) {
            Alert.alert('Email already exists');
            return;
        }
        let downloadURL;
        if (selectedImage) {
            // Create a reference to the file you want to upload
            const fileName = selectedImage.split('/').pop();
            const storageRef = storage().ref(`profileImages/${fileName}`);

            // Upload the file to Firebase Storage
            await storageRef.putFile(selectedImage);

            // Get the download URL of the uploaded file
            downloadURL = await storageRef.getDownloadURL();
        } else {
            // Use default image URL when no image is selected
            downloadURL = 'https://firebasestorage.googleapis.com/v0/b/callverse-b7cb4.appspot.com/o/user-3.png?alt=media&token=5f78f05a-99fb-47dd-b8fc-7ec4970bfba4';
        }

        // Use download URL instead of the local file path
        const userRef = firestore().collection('Users').doc(phoneNumber);
        const doc = await userRef.get();
        if (doc.exists) {
            await userRef.update({
                name,
                email,
                bio,
                profileImage: downloadURL,
            });
            Alert.alert('Profile saved successfully');
            navigation.navigate('TabStack');
        } else {
            Alert.alert('User not found');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView>
                <View style={styles.container}>
                    <Text style={{
                        marginTop: hp(2),
                        paddingHorizontal: wp(2),
                        // fontWeight: '400',
                        // marginVertical: ,
                        fontFamily: fontFamily.FONTS.Medium,
                        fontSize: hp(2.5),
                        color: COLORS.darkgray1,
                    }}>
                        Complete your profile
                    </Text>
                    <Text style={{
                        paddingHorizontal: wp(2),
                        // fontWeight: '400',
                        marginVertical: hp(1.5),
                        fontFamily: fontFamily.FONTS.regular,
                        fontSize: hp(2),
                        color: COLORS.darkgray1,
                    }}>Add a profile photo, name and bio to let people know who you are </Text>
                    <TouchableOpacity onPress={toggleMenu}>
                        <View
                            style={{
                                width: wp(35),
                                height: wp(35),
                                marginVertical: hp(1),
                                borderRadius: wp(35),
                                backgroundColor: COLORS.secondaryWhite,
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
                                    <AntDesign name="user" size={hp(7)} color={COLORS.darkgray1} />
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
                        <View style={styles.inputContainer}>
                            <Text style={styles.TextInput}>{phoneNumber}</Text>
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

                        <Text style={styles.lable}>Bio</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                placeholder="Hi there! My name is XYZ"
                                placeholderTextColor={COLORS.secondaryGray}
                                keyboardType="default"
                                style={styles.textInput}
                                onChangeText={(text) => setBio(text)}
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

                        <Button
                            title="Save"
                            // filled
                            onPress={() => saveProfile()}
                            style={{
                                marginVertical: hp(4),
                            }}
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
        fontSize: hp(2),
        fontFamily: fontFamily.FONTS.regular,
        color: COLORS.darkgray,
        // fontWeight: '400',
        marginVertical: hp(1),
    },
    inputContainer: {
        width: '100%',
        height: hp(6),
        alignItems: 'center',
        justifyContent: 'center',
    },
    TextInput: {
        width: '100%',
        height: hp(6),
        fontSize: hp(2),
        padding: hp(1.5),
        borderRadius: wp(2),
        backgroundColor: COLORS.secondaryWhite,
        color: '#111',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textInput: {
        width: '100%',
        height: hp(6),
        fontSize: hp(2),
        borderRadius: wp(2),
        backgroundColor: COLORS.secondaryWhite,
        // paddingLeft: 22,
        color: '#111',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AddProfile;
