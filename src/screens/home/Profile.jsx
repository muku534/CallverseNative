/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import { View, Text, Image, SafeAreaView, StyleSheet, TouchableOpacity, Modal, StatusBar, Share, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import COLORS from '../../../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from '../../Components/Pixel/Index';
import AntDesign from 'react-native-vector-icons/AntDesign';
import fontFamily from '../../../constants/fontFamily';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { firebase } from '@react-native-firebase/firestore';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/action';
import AndroidOpenSettings from 'react-native-android-open-settings'
import { CommonActions } from '@react-navigation/native';

const Profile = ({ navigation }) => {
    const dispatch = useDispatch();
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
            <StatusBar backgroundColor={'#f2f2f2'} barStyle="dark-content" />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: hp(6), padding: wp(2), marginHorizontal: wp(2.3) }}>
                    <Text style={{ fontFamily: fontFamily.FONTS.bold, color: COLORS.primarygreen, fontSize: hp(3), fontWeight: 'bold' }}>Settings</Text>
                </View>
                <View style={styles.container}>
                    <TouchableOpacity activeOpacity={0.5} onPress={() => navigation.navigate('EditProfile')} style={{ borderTopWidth: wp(0.1), borderBottomWidth: wp(0.1), borderColor: COLORS.gray }}>
                        <View style={styles.userInformation}>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}>
                                <View style={styles.imageContainer}>
                                    <Image source={{ uri: userData?.photoUrl }} style={styles.userImage} />
                                </View>
                                <View style={styles.userNameContainer}>
                                    <Text style={styles.nameText}>
                                        {userData?.displayName}
                                    </Text>
                                    <Text style={styles.randomNumber}> {userData?.randomNumber} </Text>
                                </View>
                            </View>
                            <AntDesign
                                name="downcircleo"
                                size={hp(3)}
                                color={COLORS.primarygreen} />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.menuContainer}>
                        <TouchableOpacity onPress={toggleMenu}
                            style={styles.TouchableOpacity}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuItems}>
                                <Entypo name="light-down"
                                    size={hp(3.7)}
                                    color={COLORS.black} />
                                <View>
                                    <Text style={styles.modalText}>Appearance</Text>
                                    <Text style={styles.modalSubText}>Customize the theme and display settings</Text>
                                </View>
                            </View>

                        </TouchableOpacity>

                        <Modal visible={showMenu} transparent animationType="fade">
                            <TouchableOpacity
                                style={styles.model}
                                onPress={toggleMenu}
                                activeOpacity={0.7}
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

                        <TouchableOpacity onPress={() => AndroidOpenSettings.appNotificationSettings()}
                            style={styles.TouchableOpacity}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuItems}>
                                <Ionicons name="notifications-outline"
                                    size={hp(3.7)}
                                    color={COLORS.black} />
                                <View>
                                    <Text style={styles.modalText}>Notifications</Text>
                                    <Text style={styles.modalSubText}>Manage your notification preferences</Text>
                                </View>
                            </View>

                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => {
                            console.log('presser');
                        }}
                            style={styles.TouchableOpacity}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuItems}>
                                <MaterialCommunityIcons name="shield-lock-open-outline"
                                    size={hp(3.7)}
                                    color={COLORS.black} />
                                <View>
                                    <Text style={styles.modalText}>Privacy</Text>
                                    <Text style={styles.modalSubText}>Control your privacy settings</Text>
                                </View>

                            </View>

                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => AndroidOpenSettings.appDetailsSettings()}
                            style={styles.TouchableOpacity}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuItems}>
                                <MaterialIcons name="storage"
                                    size={hp(3.7)}
                                    color={COLORS.black} />
                                <View>
                                    <Text style={styles.modalText}>Data usage</Text>
                                    <Text style={styles.modalSubText}>Manage your data and storage usage</Text>
                                </View>

                            </View>

                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => {
                            console.log('presser');
                        }}
                            style={styles.TouchableOpacity}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuItems}>
                                <Ionicons name="help-circle-outline"
                                    size={hp(4)}
                                    color={COLORS.black} />
                                <View>
                                    <Text style={styles.modalText}>Help</Text>
                                    <Text style={styles.modalSubText}>Get help and support for the app</Text>
                                </View>
                            </View>

                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleShare}
                            style={styles.TouchableOpacity}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuItems}>
                                <MaterialCommunityIcons name="email-outline"
                                    size={hp(3.7)}
                                    color={COLORS.black} />
                                <View>
                                    <Text style={styles.modalText}>Invite Your Friends</Text>
                                    <Text style={styles.modalSubText}>Share the app with your friends</Text>
                                </View>
                            </View>

                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.logOutContainer}
                            onPress={handleLogout}
                            activeOpacity={0.7}
                        >
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <MaterialCommunityIcons name="logout-variant"
                                    size={hp(3.5)}
                                    color={COLORS.black} />
                                <Text style={{ marginLeft: wp(2), color: 'red', fontFamily: fontFamily.FONTS.Medium, fontSize: hp(2.6) }}>
                                    Logout
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: hp(1),
    },
    userInformation: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginLeft: wp(7),
        marginRight: wp(4),
        marginBottom: hp(1.5),
        marginTop: hp(1.5)
    },
    imageContainer: {
        height: hp(5),
        width: wp(12),
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
        alignItems: 'flex-start',
        marginHorizontal: wp(7)
    },
    nameText: {
        fontFamily: fontFamily.FONTS.Medium,
        fontSize: hp(2.4),
        color: COLORS.black,
        paddingLeft: wp(1)
    },
    randomNumber: {
        color: COLORS.darkgray1,
        fontFamily: fontFamily.FONTS.regular,
        fontSize: hp(2.2),
    },
    rightArrow: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
    },
    menuContainer: {
        marginVertical: hp(1),
    },
    TouchableOpacity: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: hp(1.3),
        marginHorizontal: wp(4),
    },
    menuItems: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    menuText: {
        fontFamily: fontFamily.FONTS.regular,
        fontSize: hp(2.5),
        color: COLORS.black,
        marginLeft: wp(5),
    },
    model: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalText: {
        color: COLORS.darkgray,
        fontSize: hp(2.2),
        paddingHorizontal: wp(2.7),
    },
    modalSubText: {
        color: '#a6a6a6',
        fontWeight: '600',
        fontSize: hp(1.9),
        paddingHorizontal: wp(2.7),
    },
    logOutContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginHorizontal: wp(4),
        marginTop: hp(10),
        alignItems: 'center',
    },
    divider: {
        width: '100%',
        height: 0.4,
        backgroundColor: COLORS.gray, // Adjust color as needed
        // marginVertical: hp(0.5), // Spacing around the divider
    },
});
export default Profile;


