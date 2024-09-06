import React from 'react';
import { View, Text, Modal, Image, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { COLORS } from '../../../constants'; // Make sure to import your colors from the constants
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../Pixel/Index';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import { SharedElement } from 'react-navigation-shared-element';
import { useNavigation } from '@react-navigation/native';

const UserModal = ({ visible, onClose, userData },) => {
    const navigation = useNavigation();
    if (!userData) return null; // Return null if there's no user data

    const handleNavigation = (screen, data) => {
        onClose(); // Close the modal first
        setTimeout(() => {
            navigation.navigate(screen, { userData: data }); // Navigate to the desired screen after a slight delay
        }, 300); // Delay for 300ms to ensure the modal has closed
    }


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
                                    resizeMode='cover'
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
                                    <Ionicons name="chatbox-ellipses-outline" size={hp(3.9)} style={styles.footerIcon} />
                                </TouchableOpacity>
                                <TouchableOpacity activeOpacity={0.7}>
                                    <Ionicons name="videocam-outline" size={hp(3.9)} style={styles.footerIcon} />
                                </TouchableOpacity>
                                <TouchableOpacity activeOpacity={0.7} onPress={() => handleNavigation('VoiceCall', userData)}>
                                    <Ionicons name="call-outline" size={hp(3.9)} style={styles.footerIcon} />
                                </TouchableOpacity>
                                <TouchableOpacity activeOpacity={0.7} onPress={() => handleNavigation('UserDetail', userData)}>
                                    <Ionicons name="information-circle-outline" size={hp(3.9)} style={styles.footerIcon} />
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
        backgroundColor: 'rgba(0, 0, 0, 0.2)', // Semi-transparent overlay
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
        height: hp(41),
        alignItems: 'center',
    },
    profileImage: {
        width: wp(70),
        height: wp(70),
        borderRadius: wp(70)
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#f2f5f5', // Semi-transparent overlay
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
        color: COLORS.lightGreen,
    },
});
