import React from 'react';
import { View, Text, Modal, Image, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { COLORS } from '../../../constants'; // Make sure to import your colors from the constants
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../Pixel/Index';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import { SharedElement } from 'react-navigation-shared-element';

const UserModal = ({ visible, onClose, userData }) => {
    if (!userData) return null; // Return null if there's no user data

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType='fade'
            onRequestClose={onClose}
        >

            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <View style={styles.content}>
                            <SharedElement id={`item.${userData.id}.photo`}>
                                <Image
                                    source={{ uri: userData.photoUrl }}
                                    style={styles.profileImage}
                                />
                            </SharedElement>

                            {/* Header Overlay */}
                            <View style={styles.header}>
                                <Text style={styles.headerText}>{userData.name || userData.displayName}</Text>
                            </View>
                        </View>
                        {/* Footer Overlay */}
                        <View style={styles.footer}>
                            <View style={styles.footerButtonsContainer}>
                                <TouchableOpacity activeOpacity={0.7}>
                                    <Ionicons name="chatbox-ellipses-outline" size={hp(3.5)} style={styles.footerIcon} />
                                </TouchableOpacity>
                                <TouchableOpacity activeOpacity={0.7}>
                                    <Ionicons name="videocam-outline" size={hp(3.8)} style={styles.footerIcon} />
                                </TouchableOpacity>
                                <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('VoiceCall', { UserData: userData })}>
                                    <Ionicons name="call-outline" size={hp(3.5)} style={styles.footerIcon} />
                                </TouchableOpacity>
                                <TouchableOpacity activeOpacity={0.7}>
                                    <Ionicons name="information-circle-outline" size={hp(3.8)} style={styles.footerIcon} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default UserModal;

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        // justifyContent: 'center',
        paddingVertical: hp(15),
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    modalContainer: {
        width: wp(80),
        backgroundColor: COLORS.white,
        borderRadius: wp(2),
        overflow: 'hidden', // Ensure content respects the border radius
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: hp(1),
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent overlay
        // alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        fontSize: hp(2.5),
        paddingHorizontal: wp(5),
        fontWeight: 'bold',
        color: COLORS.tertiaryWhite,
    },
    content: {
        height: hp(40),
        alignItems: 'center',
    },
    profileImage: {
        width: wp(80),  // Full width of the modal
        height: hp(35), // Adjust height as needed
    },
    userName: {
        fontSize: hp(2.5),
        fontWeight: 'bold',
        color: COLORS.darkgray,
    },
    userPhone: {
        fontSize: hp(2),
        color: COLORS.darkgray,
        marginTop: hp(1),
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 1)', // Semi-transparent overlay
        paddingVertical: hp(1),
        alignItems: 'center',
    },
    footerButtonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '80%',
    },
    footerIcon: {
        color: COLORS.secondaryWhite,
    },
});
