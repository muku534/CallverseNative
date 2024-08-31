import React, { useState, useRef } from 'react';
import { Text, View, Modal, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from '../Components/Pixel/Index';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Entypo from 'react-native-vector-icons/Entypo';
import { COLORS } from '../../constants';
import Contacts from '../screens/home/contact';
import Chats from '../screens/home/Chat';
import Profile from '../screens/home/Profile';
import AddContact from '../screens/home/AddContact';

const Tab = createBottomTabNavigator();

const TabStack = ({ navigation }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const buttonRef = useRef(null);

    const openModal = () => {
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    const handleNavigation = (screen) => {
        setIsModalVisible(false);
        navigation.navigate(screen);
    }

    return (
        <>
            <Tab.Navigator
                initialRouteName="HomeScreen"
                screenOptions={{
                    tabBarShowLabel: false,
                    tabBarStyle: {
                        position: 'absolute',
                        width: '100%',
                        height: hp(7.5),
                        backgroundColor: '#fff',
                        borderTopColor: '#f2f2f2',
                    },
                }}
            >
                <Tab.Screen name="HomeScreen" component={Chats} options={{
                    headerShown: false,
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ focused }) => (
                        <View style={{ alignItems: 'center' }}>
                            {focused ? (
                                <Entypo name="home" size={hp(4)} color={COLORS.darkgray} />
                            ) : (
                                <AntDesign name="home" size={hp(3.5)} color={COLORS.darkgray} />
                            )}
                        </View>
                    ),
                }}
                />
                <Tab.Screen name="Contacts" component={Contacts} options={{
                    headerShown: false,
                    tabBarLabel: 'Contacts',
                    tabBarIcon: ({ focused, color, size }) => (
                        <View style={{ alignItems: 'center', zIndex: 10 }}>
                            {/* Chat button to open the modal */}
                            <TouchableOpacity
                                ref={buttonRef}
                                onPress={isModalVisible ? closeModal : openModal}
                                style={[
                                    styles.chatButton,
                                    {
                                        backgroundColor: isModalVisible ? COLORS.darkgray : COLORS.darkgray,
                                    },
                                ]}
                                activeOpacity={0.7}
                            >
                                {isModalVisible ? null : <FontAwesome6 name="plus" size={hp(2.4)} color={COLORS.secondaryWhite} />}
                                <Text style={{ color: COLORS.secondaryWhite, fontSize: hp(1.9), paddingHorizontal: wp(1.5) }}>
                                    {isModalVisible ? 'Close' : 'New Chat'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ),
                }} />
                <Tab.Screen name="Profile" component={Profile} options={{
                    headerShown: false,
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ focused }) => (
                        <View style={{ alignItems: 'center' }}>
                            {focused ? (
                                <MaterialCommunityIcons name="account" size={hp(4.5)} color={COLORS.darkgray} />
                            ) : (
                                <MaterialCommunityIcons name="account-outline" size={hp(4)} color={COLORS.darkgray} />
                            )}
                        </View>
                    ),
                }} />
            </Tab.Navigator>

            {/* Modal */}
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="slide"
            >
                <TouchableWithoutFeedback onPress={closeModal}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={() => { }}>
                            <View style={styles.modalContent}>
                                {/* Modal Items */}
                                <TouchableOpacity onPress={() => handleNavigation('Contacts')}>
                                    <View style={styles.modalItem}>
                                        <MaterialCommunityIcons name="message-text-outline" size={hp(3.2)} color={COLORS.darkgray} />
                                        <View>
                                            <Text style={styles.modalText}>New Chat</Text>
                                            <Text style={styles.modalSubText}>Send a messages to your contact</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                <View style={styles.divider} />
                                <TouchableOpacity onPress={() => handleNavigation('AddContact')}>
                                    <View style={styles.modalItem}>
                                        <AntDesign name="contacts" size={hp(3)} color={COLORS.darkgray} />
                                        <View>
                                            <Text style={styles.modalText}>Add Contact</Text>
                                            <Text style={styles.modalSubText}>Add a contact to be able to send messages</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                <View style={styles.divider} />
                                <TouchableOpacity onPress={() => handleNavigation('Profile')}>
                                    <View style={styles.modalItem}>
                                        <AntDesign name="setting" size={hp(3)} color={COLORS.darkgray} />
                                        <View>
                                            <Text style={styles.modalText}>Settings</Text>
                                            <Text style={styles.modalSubText}>Settings</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    chatButton: {
        marginVertical: hp(0.8),
        alignItems: 'center',
        width: wp(45),
        backgroundColor: COLORS.darkgray,
        borderRadius: wp(7),
        height: hp(5.5),
        justifyContent: 'center',
        flexDirection: 'row',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end', // Position the modal content at the bottom
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.1)', // Slight transparency for overlay effect
    },
    modalContent: {
        justifyContent: 'center', // Position the modal content at the bottom
        // alignItems: 'center',
        backgroundColor: COLORS.white,
        // padding: wp(5),
        borderRadius: wp(5),
        width: wp(90), // Adjust width as necessary
        marginBottom: hp(8), // Position just above the tab bar
    },
    modalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(5),
        paddingVertical: hp(1.3), // Padding for vertical spacing
    },
    modalText: {
        color: COLORS.darkgray,
        fontSize: hp(2),
        paddingHorizontal: wp(2.7),
    },
    modalSubText: {
        color: '#a6a6a6',
        fontWeight: '600',
        fontSize: hp(1.8),
        paddingHorizontal: wp(2.7),
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: COLORS.gray, // Adjust color as needed
        marginVertical: hp(0.5), // Spacing around the divider
    },
});

export default TabStack;
