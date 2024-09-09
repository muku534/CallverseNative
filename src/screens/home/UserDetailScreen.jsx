import {
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Switch
} from 'react-native';
import React, { useState } from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../Components/Pixel/Index';
import { COLORS } from '../../../constants';
import { SharedElement } from 'react-navigation-shared-element';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';

const UserDetailScreen = ({ navigation, route }) => {
    const UserData = route.params;
    console.log("UserData", UserData)
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const toggleNotifications = () => setNotificationsEnabled(previousState => !previousState);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar backgroundColor={'#ebebeb'} barStyle="dark-content" />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ marginBottom: hp(1), backgroundColor: COLORS.white }}>
                    {/* Profile Image with Overlay */}
                    <View style={styles.imageContainer}>
                        <SharedElement id={`item.${UserData.id}.photo`}>
                            <Image
                                source={{ uri: UserData.photoUrl }} // Replace with actual image source
                                style={styles.profileImage}
                            />
                        </SharedElement>

                        {/* Top Bar Overlay */}
                        <View style={styles.topBar}>
                            <TouchableOpacity onPress={() => navigation.goBack()} >
                                <Ionicons name="arrow-back" size={hp(3.5)} color={COLORS.darkgray1} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.container}>
                        {/* User Details */}
                        <Text style={styles.userName}>{UserData.name || UserData.displayName}</Text>
                        <Text style={styles.userPhone}>{UserData.randomNumber}</Text>

                        <View style={styles.footer}>
                            <View style={styles.footerButtonsContainer}>
                                <TouchableOpacity activeOpacity={0.5} style={{ alignItems: 'center', borderRadius: wp(1.9), padding: wp(2), width: wp(22), borderWidth: 0.3, borderColor: COLORS.gray }}>
                                    <Ionicons name="chatbox-ellipses-outline" size={hp(4)} style={styles.footerIcon} />
                                    <Text style={{ fontSize: hp(1.8), color: COLORS.darkgray1 }}>Messages</Text>
                                </TouchableOpacity>
                                <TouchableOpacity activeOpacity={0.5} style={{ alignItems: 'center', borderRadius: wp(1.9), padding: wp(2), width: wp(22), borderWidth: 0.3, borderColor: COLORS.gray }}>
                                    <Ionicons name="videocam-outline" size={hp(4)} style={styles.footerIcon} />
                                    <Text style={{ fontSize: hp(1.8), color: COLORS.darkgray1 }}>Video</Text>
                                </TouchableOpacity>
                                <TouchableOpacity activeOpacity={0.5} onPress={() => handleNavigation('VoiceCall', UserData)} style={{ alignItems: 'center', width: wp(22), borderRadius: wp(1.9), padding: wp(2), borderWidth: 0.3, borderColor: COLORS.gray }}>
                                    <Ionicons name="call-outline" size={hp(4)} style={styles.footerIcon} />
                                    <Text style={{ fontSize: hp(1.8), color: COLORS.darkgray1 }}>Audio</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={{ marginBottom: hp(1), paddingVertical: hp(0.5), backgroundColor: COLORS.white }}>
                    <View style={styles.Biocontainer}>
                        <Text style={styles.bio}>{UserData.bio || 'Real is really rare 💫❤'}</Text>
                        <Text style={styles.lastUpdate}>13 sep 2022</Text>
                    </View>
                </View>

                <View style={{ marginBottom: hp(1), paddingVertical: hp(0.4), backgroundColor: COLORS.white }}>
                    <View style={styles.Biocontainer}>
                        <TouchableOpacity style={{ paddingVertical: hp(1.6), paddingHorizontal: wp(1), flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialCommunityIcons name="block-helper" size={hp(2.7)} color={COLORS.red} />
                            <Text style={styles.danger}>Block {UserData.name || UserData.displayName}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialCommunityIcons name="delete-outline" size={hp(3.5)} color={COLORS.red} />
                            <Text style={{
                                color: COLORS.red,
                                paddingHorizontal: wp(2.5),
                                fontSize: hp(2.4),
                            }}>Delete chats</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

export default UserDetailScreen;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f2f5f5', // Background color for the top area
    },
    imageContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    topBar: {
        width: wp(100),
        position: 'absolute',
        top: hp(1.5),
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // width: wp(2),
        paddingHorizontal: wp(3),
        paddingVertical: hp(1.2),
        // backgroundColor: 'rgba(0, 0, 0, 0.4)', // Slight transparency for the overlay
    },
    topBarIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconMargin: {
        marginHorizontal: wp(3),
    },
    container: {
        alignItems: 'center',
        // backgroundColor: COLORS.white, // Background color for the content area
        paddingBottom: hp(1), // Adding bottom padding for spacing
    },
    Biocontainer: {
        // alignItems: 'center',
        marginHorizontal: wp(4),
        justifyContent: 'flex-start',
        // backgroundColor: COLORS.white, // Background color for the content area
        paddingBottom: hp(1), // Adding bottom padding for spacing
    },
    profileImage: {
        marginTop: hp(5),
        width: wp(35),
        height: wp(35),
        borderRadius: wp(35)
    },
    userName: {
        fontSize: hp(2.5),
        fontWeight: '600',
        color: COLORS.darkgray,
        marginVertical: hp(0.8),
    },
    bio: {
        fontSize: hp(2.4),
        color: COLORS.darkgray1,
        paddingBottom: hp(0.5)
    },
    danger: {
        color: COLORS.red,
        paddingHorizontal: wp(3),
        fontSize: hp(2.5),
        // fontWeight: '500',
        // marginVertical: hp(0.5),
    },
    lastUpdate: {
        fontSize: hp(1.9),
        fontWeight: '600',
        color: COLORS.secondaryGray,
        // marginVertical: hp(0.5),
    },
    userPhone: {
        fontSize: hp(2.3),
        color: COLORS.darkgray1,
    },
    infoText: {
        fontSize: hp(2.2),
        color: COLORS.black,
    },
    footer: {
        marginVertical: hp(1),
        paddingVertical: hp(1),
        alignItems: 'center',
    },
    footerButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Evenly space between buttons
        width: wp(80), // Define a specific width for equal spacing
    },
    footerIcon: {
        color: COLORS.lightGreen,
    },
});
