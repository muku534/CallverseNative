/* eslint-disable prettier/prettier */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import { SafeAreaView, StatusBar, StyleSheet, Text, View, Image, TextInput, TouchableOpacity, FlatList, } from 'react-native';
import React, { useState, useEffect, } from 'react';
import { COLORS } from '../../../constants';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from '../../Components/Pixel/Index';
import fontFamily from '../../../constants/fontFamily';
import Iconics from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import { useSelector } from 'react-redux';
import { SharedElement } from 'react-navigation-shared-element';
import UserModal from '../../Components/UserModel/UserModel';
import { fetchContacts } from '../../redux/action';


const Contacts = ({ navigation }) => {
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const contacts = useSelector(state => state.contacts)
    const [filteredChats, setFilteredChats] = useState(contacts);
    const [selectedContact, setSelectedContact] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const toggelInput = () => {
        setSearchVisible(!searchVisible);
    };

    useEffect(() => {
        if (searchText === '') {
            setFilteredChats(contacts);
        } else {
            setFilteredChats(contacts.filter(chat =>
                (chat.name && chat.name.toLowerCase().includes(searchText.toLowerCase())) ||
                (chat.message && chat.message.toLowerCase().includes(searchText.toLowerCase()))
            ));
        }
    }, [searchText, contacts]);

    const clearSearch = () => {
        setSearchText('');
    };

    const handleLongPress = (contact) => {
        setSelectedContact(contact);
    };

    // Function to handle opening the modal
    const openUserModal = (user) => {
        setSelectedUser(user);
        setIsModalVisible(true);
    };

    // Function to close the modal
    const closeUserModal = () => {
        setIsModalVisible(false);
        setSelectedUser(null);
    };

    const deleteSelectedChats = async () => {
        const previousContactsState = [...contacts]; // Keep a copy of the current state

        try {
            // Optimistically update local state before Firestore operation
            const updatedContactsState = contacts.filter(contact => !selectedChats.includes(contact));
            setUpdatedChats(updatedContactsState); // Update state optimistically
            dispatch(fetchContacts(updatedContactsState)); // Dispatch updated chats

            // Show a Toast message to inform the user (Android only)
            ToastAndroid.show("Contact(s) deleted.", ToastAndroid.SHORT);

            // Perform Firestore deletion
            await Promise.all(selectedChats.map(async contact => {
                await firestore().collection('Contacts').doc(contact.id).delete();
            }));

            // Clear selection after deletion
            setSelectedContact([]);
        } catch (error) {
            console.error("Error deleting chats:", error);
            // Revert to previous state in case of error
            ToastAndroid.show("An error occurred while deleting the chat(s). Please try again.", ToastAndroid.SHORT);
        }
    };


    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar backgroundColor={'#f2f2f2'} barStyle="dark-content" />

            {searchVisible ? (
                <View style={{}}>
                    <View style={{ width: '90%', marginVertical: hp(1), marginHorizontal: wp(5), flexDirection: 'row', justifyContent: 'center', backgroundColor: '#e8e8e8', borderRadius: wp(4) }}>
                        <TouchableOpacity onPress={toggelInput} style={{ marginLeft: wp(10) }} activeOpacity={0.7}>
                            <AntDesign name="arrowleft" size={hp(3)} color={COLORS.black} style={{ position: 'absolute', left: 10, top: 10 }} />
                        </TouchableOpacity>
                        <TextInput
                            placeholder="Search..."
                            placeholderTextColor={COLORS.darkgray1}
                            keyboardType="default"
                            autoFocus={true}
                            value={searchText}
                            style={{ width: '100%', marginLeft: wp(10), height: hp(6), color: COLORS.darkgray, fontFamily: fontFamily.FONTS.regular, }}
                            onChangeText={(text) => setSearchText(text)}
                        />
                        {searchText.length > 0 && ( // Conditionally render the cross icon
                            <TouchableOpacity onPress={clearSearch} style={{ position: 'absolute', right: 10, top: 10 }}>
                                <Entypo name="cross" size={hp(3)} color={COLORS.black} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            ) : (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: hp(6), padding: wp(2), }}>
                    <View>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <AntDesign name="arrowleft" size={hp(3)} color={COLORS.black} />
                            <Text style={{ fontFamily: fontFamily.FONTS.bold, color: COLORS.primarygreen, fontSize: hp(3), fontWeight: '700', marginHorizontal: wp(2) }}>Contacts</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={toggelInput} style={{ marginHorizontal: wp(2.3) }}>
                        <Iconics name="search" size={hp(3.3)} color={COLORS.darkgray} />
                    </TouchableOpacity>
                </View>
            )}
            <View style={styles.divider} />

            <View style={{ marginVertical: hp(1) }}>
                <FlatList
                    data={filteredChats}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => navigation.navigate('PersonalChats', { User: item })} onLongPress={() => handleLongPress(item)}>
                            <View style={[item === selectedContact && styles.selectedContact, { flexDirection: 'row', padding: wp(2), alignItems: 'center', marginHorizontal: wp(2.3) }]}>
                                <TouchableOpacity onPress={() => openUserModal(item)}>
                                    <SharedElement id={`item.${item.id}.photo`}>
                                        <Image source={{ uri: item.photoUrl }} style={{ width: wp(13), height: wp(13), borderRadius: wp(13) }} />
                                    </SharedElement>
                                </TouchableOpacity>
                                <View style={{ flexDirection: 'column' }}>
                                    <Text style={{ marginLeft: wp(2.2), paddingTop: hp(0.5), fontFamily: fontFamily.FONTS.Medium, fontSize: hp(2.2), color: COLORS.darkgray }} numberOfLines={1}>{item.name}</Text>
                                    <Text style={{ marginLeft: wp(2.2), fontFamily: fontFamily.FONTS.regular, fontSize: hp(1.8), color: COLORS.darkgray1 }} numberOfLines={1}>{item.message}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item.randomNumber}
                    ListEmptyComponent={() => (
                        <View style={{ flex: 1, marginVertical: hp(30), justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: hp(2.2), padding: hp(1.5), color: COLORS.secondaryGray }}>you dont have any contacts add contact click on the + button </Text>
                        </View>
                    )}
                />

            </View>

            {/* User Modal */}
            <UserModal
                visible={isModalVisible}
                onClose={closeUserModal}
                userData={selectedUser}
            />
        </SafeAreaView>
    );
};

export default Contacts;

const styles = StyleSheet.create({
    selectedContact: {
        backgroundColor: COLORS.gray, // Change the background color for the selected contact
    },
    divider: {
        width: '100%',
        height: 0.4,
        backgroundColor: COLORS.gray, // Adjust color as needed
        // marginVertical: hp(0.5), // Spacing around the divider
    },
});
