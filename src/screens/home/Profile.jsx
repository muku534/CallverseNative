/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import { View, Text, Pressable, Image, Alert, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput, StatusBar, Share, Linking } from 'react-native';
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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
// import firestore from '@react-native-firebase/firestore';
import { firebase } from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import messaging from '@react-native-firebase/messaging';
import { useSelector } from 'react-redux';
import { logout } from '../../redux/action';


const Profile = ({ navigation }) => {
    const [showMenu, setShowMenu] = useState(false);
    const userData = useSelector(state => state.userData)

    const toggleMenu = () => {
        setShowMenu(!showMenu);
    };

    const handleMenuOption = (option) => {
        if (option === 'viewProfile') {
            console.log('View Profile');
        } else if (option === 'removeProfile') {
            console.log('Remove Profile');
        }
        toggleMenu();
    };


    const handleShare = async () => {
        try {
            // // Path to the APK file in Firebase Storage
            // const firebaseStoragePath = 'APK/CallVerse.apk';

            // // Get the download URL of the APK file
            const url = 'https://bit.ly/CallVerseApp';

            // Share the download URL
            const result = await Share.share({
                message: `Download the app from this URL: ${url}`,
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    console.log('Shared with activity type of ', result.activityType);
                } else {
                    console.log('Shared');
                }
            } else if (result.action === Share.dismissedAction) {
                console.log('Dismissed');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await firebase.auth().signOut();
            // Clear user data from AsyncStorage
            await AsyncStorage.removeItem('userData');
            await AsyncStorage.removeItem('randomNumber');
            // Navigate to login screen or any other screen
            dispatch(logout())
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                })
            );
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, }}>
            <StatusBar backgroundColor={COLORS.lightGreen} barStyle="light-content" />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.lightGreen, height: hp(8), padding: wp(3), shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 4 }}>
                <Text style={{ fontFamily: fontFamily.FONTS.bold, color: COLORS.tertiaryWhite, fontSize: hp(2.5), fontWeight: '700' }}>Settings</Text>
            </View>

            <View style={styles.container}>
                {/*<View style={styles.header}>
                    <Text >Settings</Text>
                </View> */}

                <View style={styles.userInformation}>

                    <View style={styles.imageContainer}>
                        <Image source={{ uri: userData?.photoUrl }} style={styles.userImage} />
                    </View>
                    <View style={styles.userNameContainer}>
                        <Text style={styles.nameText}>
                            {userData?.displayName}
                        </Text>
                        <Text style={styles.randomNumber}> {userData?.randomNumber} </Text>
                    </View>

                    <TouchableOpacity onPress={() => navigation.navigate('AddProfile')} style={styles.rightArrow}>
                        <MaterialIcons name="keyboard-arrow-right" size={24}
                            color={COLORS.black} />
                    </TouchableOpacity>
                </View>
                <View style={styles.menuContainer}>
                    <TouchableOpacity onPress={() => navigation.navigate('AddProfile')}
                        style={styles.TouchableOpacity}
                    >
                        <View style={styles.menuItems}>
                            <AntDesign name="user"
                                size={24}
                                color={COLORS.black} />
                            <Text style={styles.menuText}>
                                Account
                            </Text>
                        </View>
                        <MaterialIcons
                            name="keyboard-arrow-right"
                            size={24}
                            color={COLORS.black} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Chats')}
                        style={styles.TouchableOpacity}
                    >
                        <View style={styles.menuItems}>
                            <Ionicons
                                name="chatbubble-ellipses-outline"
                                size={24}
                                color={COLORS.black} />
                            <Text style={styles.menuText}>
                                Chat
                            </Text>
                        </View>
                        <MaterialIcons
                            name="keyboard-arrow-right"
                            size={24}
                            color={COLORS.black} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={toggleMenu}
                        style={styles.TouchableOpacity}
                    >
                        <View style={styles.menuItems}>
                            <Entypo name="light-down"
                                size={24}
                                color={COLORS.black} />
                            <Text style={styles.menuText}>
                                Appearance
                            </Text>
                        </View>
                        <MaterialIcons
                            name="keyboard-arrow-right"
                            size={24}
                            color={COLORS.black} />
                    </TouchableOpacity>

                    <Modal visible={showMenu} transparent animationType="fade">
                        <TouchableOpacity
                            style={styles.model}
                            onPress={toggleMenu}
                        >
                            <View style={{
                                backgroundColor: COLORS.white, borderRadius: wp(2), padding: hp(3), width: wp(60),
                                height: hp(20),
                            }}>
                                <TouchableOpacity style={{ paddingVertical: 8 }} onPress={() => handleMenuOption('viewProfile')}>
                                    <Text >Light</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ paddingVertical: 8 }} onPress={() => handleMenuOption('removeProfile')}>
                                    <Text >Dark</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </Modal>

                    <TouchableOpacity onPress={() => {
                        Linking.openSettings();
                    }}
                        style={styles.TouchableOpacity}
                    >
                        <View style={styles.menuItems}>
                            <Ionicons name="notifications-outline"
                                size={24}
                                color={COLORS.black} />
                            <Text style={styles.menuText}>
                                Notifications
                            </Text>
                        </View>
                        <MaterialIcons
                            name="keyboard-arrow-right"
                            size={24}
                            color={COLORS.black} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {
                        console.log('presser');
                    }}
                        style={styles.TouchableOpacity}
                    >
                        <View style={styles.menuItems}>
                            <MaterialCommunityIcons name="shield-lock-open-outline"
                                size={24}
                                color={COLORS.black} />
                            <Text style={styles.menuText}>
                                Privacy
                            </Text>
                        </View>
                        <MaterialIcons
                            name="keyboard-arrow-right"
                            size={24}
                            color={COLORS.black} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {
                        Linking.openSettings();
                    }}
                        style={styles.TouchableOpacity}
                    >
                        <View style={styles.menuItems}>
                            <AntDesign name="folder1"
                                size={24}
                                color={COLORS.black} />
                            <Text style={styles.menuText}>
                                Data usage
                            </Text>
                        </View>
                        <MaterialIcons
                            name="keyboard-arrow-right"
                            size={24}
                            color={COLORS.black} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {
                        console.log('presser');
                    }}
                        style={styles.TouchableOpacity}
                    >
                        <View style={styles.menuItems}>
                            <Ionicons name="help-circle-outline"
                                size={24}
                                color={COLORS.black} />
                            <Text style={styles.menuText}>
                                Help
                            </Text>
                        </View>
                        <MaterialIcons
                            name="keyboard-arrow-right"
                            size={24}
                            color={COLORS.black} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleShare}
                        style={styles.TouchableOpacity}
                    >
                        <View style={styles.menuItems}>
                            <MaterialCommunityIcons name="email-outline"
                                size={24}
                                color={COLORS.black} />
                            <Text style={styles.menuText}>
                                Invite Your Friends
                            </Text>
                        </View>
                        <MaterialIcons
                            name="keyboard-arrow-right"
                            size={24}
                            color={COLORS.black} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.logOutContainer}
                        onPress={handleLogout}
                    >
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: hp(10),
                        }}>
                            <MaterialCommunityIcons name="logout-variant"
                                size={24}
                                color={COLORS.black} />
                            <Text style={{ marginLeft: wp(2), color: 'red', fontFamily: fontFamily.FONTS.Medium, fontSize: hp(2.2) }}>
                                Logout
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        // flex: 1
        marginVertical: hp(3),
    },
    // header: {
    //     flexDirection: 'row',
    //     justifyContent: 'center',
    //     alignItems: 'center',
    //     paddingHorizontal: 22,
    //     marginVertical: 22,
    //     marginTop: 15,
    // },
    userInformation: {
        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent: 'center',
        marginHorizontal: wp(7),
    },
    imageContainer: {
        height: hp(5),
        width: wp(12),
        // borderRadius: ,
        backgroundColor: COLORS.secondaryWhite,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userImage: {
        width: wp(17),
        height: wp(17),
        borderRadius: wp(17),
        marginVertical: hp(1),
    },
    userNameContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        // marginHorizontal: wp(7)
    },
    nameText: {
        // ...FONTS.h4,
        // marginVertical: hp(1),
        fontFamily: fontFamily.FONTS.Medium,
        fontSize: hp(2.2),
        color: COLORS.black,
        marginHorizontal: wp(25),
    },
    randomNumber: {
        // ...FONTS.body3,
        color: COLORS.darkgray1,
        fontFamily: fontFamily.FONTS.regular,
        fontSize: hp(1.8),



    },
    rightArrow: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        // marginLeft: 55,
    },
    menuContainer: {
        marginVertical: hp(4),
    },
    TouchableOpacity: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: hp(1.3),
        marginHorizontal: wp(4),
        // paddingVertical: 12,
    },
    menuItems: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    menuText: {
        // ...FONTS.h4,
        fontFamily: fontFamily.FONTS.regular,
        fontSize: hp(2.2),
        color: COLORS.black,
        marginLeft: wp(5),
        // justifyContent:'center',
        // alignItems:'center',
    },
    model: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    logOutContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginHorizontal: wp(4),
        // marginVertical: hp(3),
        alignItems: 'center',
    },
});
export default Profile;


