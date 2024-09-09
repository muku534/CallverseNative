import { SafeAreaView, StatusBar, StyleSheet, TouchableOpacity, TextInput, Text, View, Image, FlatList, TouchableWithoutFeedback, ToastAndroid } from 'react-native';
import React, { useEffect, useState, useMemo } from 'react';
import { COLORS } from '../../../constants';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from '../../Components/Pixel/Index';
import fontFamily from '../../../constants/fontFamily';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Iconics from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import Entypo from 'react-native-vector-icons/Entypo';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChats, fetchChatsRoom } from '../../redux/action';
import SelectDropdown from 'react-native-select-dropdown'; // Import the dropdown
import UserModal from '../../Components/UserModel/UserModel';
import { SharedElement } from 'react-navigation-shared-element';

const Chats = ({ navigation }) => {

    const [searchVisible, setSearchVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filteredChats, setFilteredChats] = useState([]);
    const [updatedChats, setUpdatedChats] = useState([]);

    const dispatch = useDispatch();
    const Chats = useSelector(state => state.chats);
    const chatRoom = useSelector(state => state.chatRoom);
    const [selectedChats, setSelectedChats] = useState([]);
    const storedContacts = useSelector(state => state.contacts);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

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
                    // Fetch the chat document
                    const chatDoc = await firestore().collection('chatRooms').doc(chat.id).get();
                    const chatData = chatDoc.data();
                    const messages = chatData?.messages || [];
                    const lastMessage = messages[messages.length - 1] || {};
                    const archived = chatData?.archived;
                    return {
                        ...chat,
                        otherUser: {
                            ...contact,
                            createdAt: contact.createdAt ? contact.createdAt.toDate() : null // Adjust if needed
                        },
                        message: lastMessage.text || 'No message',
                        archived: archived
                    }; // Use contact details
                } else {
                    console.log("Contact not found, fetching from Firestore...");
                    try {
                        const userDoc = await firestore().collection('Users').doc(chat.otherUser.id).get();
                        const chatDoc = await firestore().collection('chatRooms').doc(chat.id).get();
                        const chatData = chatDoc.data();
                        const messages = chatData?.messages || [];
                        const lastMessage = messages[messages.length - 1] || {};
                        const archived = chatData?.archived;

                        if (userDoc.exists) {
                            const userData = userDoc.data();
                            console.log("User data fetched from Firestore:", userData);
                            return {
                                ...chat,
                                otherUser: {
                                    ...userData,
                                    createdAt: userData.createdAt.toDate(), // Adjust based on your timestamp handling
                                },
                                message: lastMessage.text || 'No message',
                                archived: archived
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
            dispatch(fetchChatsRoom(updatedChats));
        };

        fetchUserDetails();
    }, []); // Use storedContacts in dependencies


    // Inside your useEffect where you filter chats based on search text
    useEffect(() => {
        const filterChats = () => {
            const filtered = chatRoom
                .filter(chat => !chat.archived) // Exclude archived chats
                .filter(chat => {
                    const userName = chat.otherUser.name ? chat.otherUser.name.toLowerCase() : '';
                    return userName.includes(searchText.toLowerCase());
                });
            setFilteredChats(filtered);
        };

        filterChats();
    }, [searchText, chatRoom]); //

    const unArchivedChats = useMemo(() => {
        return chatRoom.filter(chat => !chat.archived);
    }, [chatRoom]);

    const clearSearch = () => {
        setSearchText('');
    };

    const toggelInput = () => {
        setSearchVisible(!searchVisible);
    };

    const handleLongPress = (chat) => {
        setSelectedChats(prevSelectedChats => {
            if (prevSelectedChats.includes(chat)) {
                // If chat is already selected, deselect it
                return prevSelectedChats.filter(c => c !== chat);
            } else {
                // Otherwise, select the chat
                return [...prevSelectedChats, chat];
            }
        });
    };

    const archiveSelectedChats = async () => {
        // Create a copy of the current state to revert back if needed
        const previousChatsState = [...chatRoom];

        try {
            // Optimistically update local state before Firestore operation
            const updatedChatsState = chatRoom.map(chat => {
                if (selectedChats.includes(chat)) {
                    return { ...chat, archived: !chat.archived };  // Toggle the archived property
                }
                return chat;
            });

            setUpdatedChats(updatedChatsState); // Update state optimistically
            dispatch(fetchChatsRoom(updatedChatsState))
            // Show a Toast message to inform the user (Android only)
            ToastAndroid.show("Chat archived. You can find it in the Archived screen.", ToastAndroid.SHORT);

            // Perform Firestore update
            await Promise.all(selectedChats.map(async chat => {
                const newArchivedState = !chat.archived;
                await firestore().collection('chatRooms').doc(chat.id).update({ archived: newArchivedState });
            }));

            // Clear selection after archiving/unarchiving
            setSelectedChats([]);


        } catch (error) {
            console.error("Error archiving/unarchiving chats:", error);

            // Revert to previous state in case of error
            setUpdatedChats(previousChatsState);
            ToastAndroid.show("An error occurred while updating the archive status. Please try again.", ToastAndroid.SHORT);
        }
    };

    const deleteSelectedChats = async () => {
        const previousChatsState = [...chatRoom]; // Keep a copy of the current state

        try {
            // Optimistically update local state before Firestore operation
            const updatedChatsState = chatRoom.filter(chat => !selectedChats.includes(chat));
            setUpdatedChats(updatedChatsState); // Update state optimistically
            dispatch(fetchChatsRoom(updatedChatsState)); // Dispatch updated chats

            // Show a Toast message to inform the user (Android only)
            ToastAndroid.show("Chat(s) deleted.", ToastAndroid.SHORT);

            // Perform Firestore deletion
            await Promise.all(selectedChats.map(async chat => {
                await firestore().collection('chatRooms').doc(chat.id).delete();
            }));

            // Clear selection after deletion
            setSelectedChats([]);
        } catch (error) {
            console.error("Error deleting chats:", error);
            // Revert to previous state in case of error
            setUpdatedChats(previousChatsState);
            ToastAndroid.show("An error occurred while deleting the chat(s). Please try again.", ToastAndroid.SHORT);
        }
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

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar backgroundColor={'#f2f2f2'} barStyle="dark-content" />

            {searchVisible ? (
                <View style={{}}>
                    <View style={{ width: '90%', marginVertical: hp(1), marginHorizontal: wp(5), flexDirection: 'row', justifyContent: 'center', backgroundColor: '#e8e8e8', borderRadius: wp(4) }}>
                        <TouchableOpacity onPress={toggelInput} style={{ marginLeft: wp(10) }}>
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
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: hp(6), padding: wp(2), marginHorizontal: wp(2.3) }}>
                    {selectedChats.length > 0 ? (
                        <Text style={{ fontFamily: fontFamily.FONTS.bold, color: COLORS.primarygreen, fontSize: hp(2.7), fontWeight: '700', marginHorizontal: wp(2) }}>
                            {selectedChats.length} Selected {selectedChats.length > 1}
                        </Text>
                    ) : (
                        <Text style={{ fontFamily: fontFamily.FONTS.bold, color: COLORS.primarygreen, fontSize: hp(3.4), fontWeight: 'bold' }}>CallVerse</Text>
                    )}
                    {selectedChats.length > 0 ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                            <TouchableOpacity onPress={archiveSelectedChats} style={{ width: wp(8), marginHorizontal: wp(3.5) }}>
                                <MaterialIcons name="archive" size={hp(3.6)} color={COLORS.darkgray} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={deleteSelectedChats}>
                                <MaterialCommunityIcons name="delete" size={hp(3.6)} color={COLORS.darkgray} />
                            </TouchableOpacity>
                        </View>

                    ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                            <TouchableOpacity onPress={toggelInput} style={{ marginHorizontal: wp(3.5) }}>
                                <Iconics name="search" size={hp(3.6)} color={COLORS.darkgray} />
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <MaterialCommunityIcons name="phone-log-outline" size={hp(3.6)} color={COLORS.darkgray} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )
            }

            <View style={{ marginVertical: hp(1) }}>
                <FlatList
                    data={unArchivedChats}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => selectedChats.includes(item) ? handleLongPress(item) : navigation.navigate('PersonalChats', { User: item.otherUser })} onLongPress={() => handleLongPress(item)}>
                            <View style={{ flexDirection: 'row', padding: wp(2), alignItems: 'center', paddingHorizontal: wp(4), backgroundColor: selectedChats.includes(item) ? '#bcf5bc' : 'transparent', }}>
                                <View style={{ position: 'relative' }}>
                                    <TouchableOpacity onPress={() => openUserModal(item.otherUser)}>
                                        <SharedElement id={`item.${item.otherUser.id}.photo`}>
                                            <Image
                                                source={{ uri: item.otherUser.photoUrl }}
                                                style={{ width: wp(13), height: wp(13), borderRadius: wp(13) }}
                                            />
                                        </SharedElement>
                                    </TouchableOpacity>
                                    {selectedChats.includes(item) && (
                                        <View style={{
                                            backgroundColor: COLORS.tertiaryWhite,
                                            height: hp(3.5),
                                            width: hp(3.5),
                                            borderRadius: hp(3.5),
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'absolute',
                                            bottom: -5,
                                            right: -5,
                                            margin: wp(0)
                                        }}>
                                            <AntDesign
                                                name="checkcircle"
                                                size={hp(2.8)}
                                                color={COLORS.lightGreen}
                                            />
                                        </View>
                                    )}
                                </View>
                                <View style={{ flexDirection: 'column', marginLeft: wp(2.2), }}>
                                    <Text style={{ fontFamily: fontFamily.FONTS.Medium, fontSize: hp(2.3), color: COLORS.darkgray }} numberOfLines={1}>{item.otherUser.name || item.otherUser.displayName}</Text>
                                    <Text style={{ fontFamily: fontFamily.FONTS.regular, fontSize: hp(1.9), color: COLORS.primarygray }} numberOfLines={1}>{item.message}</Text>
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

            {/* User Modal */}
            <UserModal
                visible={isModalVisible}
                onClose={closeUserModal}
                userData={selectedUser}
            />

        </SafeAreaView>
    );
};

export default Chats;

const styles = StyleSheet.create({
    selectedContact: {
        backgroundColor: '#bcf5bc', // Change the background color for the selected contact
    },
});
