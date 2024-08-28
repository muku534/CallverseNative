import { SafeAreaView, StatusBar, StyleSheet, TouchableOpacity, TextInput, Text, View, Image, FlatList } from 'react-native';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { COLORS } from '../../../constants';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from '../../Components/Pixel/Index';
import fontFamily from '../../../constants/fontFamily';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Iconics from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import Entypo from 'react-native-vector-icons/Entypo';
import { useDispatch, useSelector } from 'react-redux';

const Chats = ({ navigation }) => {

    const [searchVisible, setSearchVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filteredChats, setFilteredChats] = useState([]);
    const [updatedChats, setUpdatedChats] = useState([]);

    const dispatch = useDispatch();
    const Chats = useSelector(state => state.chats);
    const storedContacts = useSelector(state => state.contacts);

    useEffect(() => {
        // Log initial data from Redux
        console.log("Initial Chats from Redux:", Chats);
        console.log("Contacts from Redux:", storedContacts);

        // Fetch user details for each chat
        const fetchUserDetails = async () => {
            console.log("Fetching user details...");

            const updatedChats = await Promise.all(Chats.map(async chat => {
                console.log(`Processing chat ID: ${chat.id}, Other User ID: ${chat.otherUser.id}`);

                // Use storedContacts directly instead of contacts state
                const contact = storedContacts.find(contact => contact.id === chat.otherUser.id);
                if (contact) {
                    console.log("Contact found in Redux contacts:", contact);
                    return {
                        ...chat,
                        otherUser: {
                            ...contact,
                            createdAt: contact.createdAt ? contact.createdAt.toDate() : null // Adjust if needed
                        }
                    }; // Use contact details
                } else {
                    console.log("Contact not found, fetching from Firestore...");
                    try {
                        const userDoc = await firestore().collection('Users').doc(chat.otherUser.id).get();

                        if (userDoc.exists) {
                            const userData = userDoc.data();
                            console.log("User data fetched from Firestore:", userData);
                            return {
                                ...chat,
                                otherUser: {
                                    ...userData,
                                    createdAt: userData.createdAt.toDate(), // Adjust based on your timestamp handling
                                }
                            };
                        } else {
                            console.log("User document does not exist in Firestore.");
                            return chat;
                        }
                    } catch (error) {
                        console.error("Error fetching user details:", error);
                        return chat;
                    }
                }
            }));
            console.log("Updated Chats after fetching user details:", updatedChats);

            setUpdatedChats(updatedChats);
            // Dispatch updated chats to Redux if needed
            // dispatch({ type: 'UPDATE_CHATS', payload: updatedChats });
        };

        fetchUserDetails();
    }, [Chats, storedContacts, dispatch]); // Use storedContacts in dependencies


    useEffect(() => {
        // Filter chats based on search text
        const filterChats = () => {
            const filtered = Chats.filter(chat => {
                const userName = chat.otherUser.displayName ? chat.otherUser.displayName.toLowerCase() : '';
                return userName.includes(searchText.toLowerCase());
            });
            setFilteredChats(filtered);
        };

        filterChats();
    }, [searchText, Chats]);

    const clearSearch = () => {
        setSearchText('');
    };

    const toggelInput = () => {
        setSearchVisible(!searchVisible);
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar backgroundColor={COLORS.lightGreen} barStyle="light-content" />

            {searchVisible ? (
                <View style={{ backgroundColor: COLORS.lightGreen, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 7 }}>
                    <View style={{ width: '90%', marginVertical: hp(1), marginHorizontal: wp(5), flexDirection: 'row', justifyContent: 'center', backgroundColor: '#e8e8e8', borderRadius: wp(4) }}>
                        <TouchableOpacity onPress={toggelInput} style={{ marginLeft: wp(10) }}>
                            <AntDesign name="arrowleft" size={hp(3)} color={COLORS.black} style={{ position: 'absolute', left: 10, top: 10 }} />
                        </TouchableOpacity>
                        <TextInput
                            placeholder="Search..."
                            placeholderTextColor={COLORS.darkgray1}
                            keyboardType="default"
                            value={searchText}
                            autoFocus={true}
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
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.lightGreen, height: hp(8), padding: wp(3), shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 4 }}>
                    <Text style={{ fontFamily: fontFamily.FONTS.bold, color: COLORS.tertiaryWhite, fontSize: hp(2.5), fontWeight: '700' }}>CallVerse</Text>
                    <TouchableOpacity onPress={toggelInput}>
                        <Iconics name="search" size={hp(3)} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            )}

            <View style={{ marginVertical: hp(1) }}>
                <FlatList
                    data={updatedChats}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => navigation.navigate('PersonalChats', { User: item.otherUser })} onLongPress={() => handleLongPress(item)}>
                            <View style={{ flexDirection: 'row', padding: wp(2), alignItems: 'center', }}>
                                <Image source={{ uri: item.otherUser.photoUrl }} style={{ width: wp(13), height: wp(13), borderRadius: wp(13) }} />
                                <View style={{ flexDirection: 'column' }}>
                                    <Text style={{ marginLeft: wp(2.2), paddingTop: hp(0.5), fontFamily: fontFamily.FONTS.Medium, fontSize: hp(2.2), color: COLORS.darkgray }} numberOfLines={1}>{item.otherUser.name}</Text>
                                    <Text style={{ marginLeft: wp(2.2), fontFamily: fontFamily.FONTS.regular, fontSize: hp(1.8), color: COLORS.darkgray1 }} numberOfLines={1}>{item.message}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={() => (
                        <View style={{ flex: 1, marginVertical: hp(30), justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: hp(2.2), padding: hp(1.5), color: COLORS.secondaryGray }}>you dont have any contacts add contact click on the + button </Text>
                        </View>
                    )}
                />
            </View>

        </SafeAreaView>
    );
};

export default Chats;

const styles = StyleSheet.create({});
