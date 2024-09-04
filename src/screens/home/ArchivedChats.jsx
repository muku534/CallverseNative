import { SafeAreaView, StatusBar, StyleSheet, TouchableOpacity, TextInput, Text, View, Image, FlatList, TouchableWithoutFeedback } from 'react-native';
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
import { SharedElement } from 'react-navigation-shared-element';
import UserModal from '../../Components/UserModel/UserModel';

const ArchivedChats = ({ navigation }) => {
    const dispatch = useDispatch();
    const chatRoom = useSelector(state => state.chatRoom);
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedChats, setSelectedChats] = useState([]);
    const storedContacts = useSelector(state => state.contacts);
    const [filteredChats, setFilteredChats] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const filterChats = () => {
            const filtered = chatRoom
                .filter(chat => {
                    const userName = chat.otherUser.name ? chat.otherUser.name.toLowerCase() : '';
                    return userName.includes(searchText.toLowerCase());
                });
            setFilteredChats(filtered);
        };

        filterChats();
    }, [searchText, chatRoom]); // Add chatRoom to the dependency array

    const ArchivedChats = useMemo(() => {
        return chatRoom.filter(chat => chat.archived);
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

            setFilteredChats(updatedChatsState); // Update state optimistically
            dispatch(fetchChatsRoom(updatedChatsState))

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
            setFilteredChats(previousChatsState);
            alert("An error occurred while updating the archive status. Please try again.");
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
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: hp(6), padding: wp(2), marginHorizontal: wp(1) }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <AntDesign name="arrowleft" size={hp(3)} color={COLORS.black} />
                        {selectedChats.length > 0 ? (
                            <Text style={{ fontFamily: fontFamily.FONTS.bold, color: COLORS.primarygreen, fontSize: hp(3), fontWeight: '700', marginHorizontal: wp(2) }}>
                                {selectedChats.length} Selected
                            </Text>
                        ) : (
                            <Text style={{ fontFamily: fontFamily.FONTS.bold, color: COLORS.primarygreen, fontSize: hp(3), fontWeight: '700', marginHorizontal: wp(2) }}>
                                Archived Chats
                            </Text>
                        )}
                    </TouchableOpacity>

                    {selectedChats.length > 0 ? (
                        <TouchableOpacity style={{ width: wp(8) }} onPress={archiveSelectedChats}>
                            <MaterialIcons name="archive" size={hp(3.3)} color={COLORS.darkgray} />
                        </TouchableOpacity>
                    ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                            <TouchableOpacity onPress={toggelInput} style={{ marginHorizontal: wp(3.5) }}>
                                <Iconics name="search" size={hp(3.3)} color={COLORS.darkgray} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
            <View style={styles.divider} />
            <View style={{ alignItems: 'center', paddingHorizontal: wp(2), paddingVertical: hp(0.5), backgroundColor: COLORS.lightYellow }}>
                <Text style={{ fontWeight: 'medium', color: COLORS.darkgray1, fontSize: hp(2), textAlign: 'center' }} >
                    You can search through your archived chats or restore them to your main chat list.
                </Text>
            </View>
            <View style={styles.divider} />
            <View style={{ marginVertical: hp(1) }}>
                <FlatList
                    data={ArchivedChats}
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
                                    <Text style={{ fontFamily: fontFamily.FONTS.Medium, fontSize: hp(2.2), color: COLORS.darkgray }} numberOfLines={1}>{item.otherUser.name || item.otherUser.displayName}</Text>
                                    <Text style={{ fontFamily: fontFamily.FONTS.regular, fontSize: hp(1.8), color: COLORS.primarygray }} numberOfLines={1}>{item.message}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={() => (
                        <View style={{ flex: 1, marginVertical: hp(30), justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: hp(2.2), padding: hp(1.5), color: COLORS.secondaryGray }}>You currently have no archived chats. Chats you archive will appear here.</Text>
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

    )
}

export default ArchivedChats;

const styles = StyleSheet.create({
    selectedContact: {
        backgroundColor: '#bcf5bc', // Change the background color for the selected contact
    },
    divider: {
        width: '100%',
        height: 0.4,
        backgroundColor: COLORS.gray, // Adjust color as needed
        // marginVertical: hp(0.5), // Spacing around the divider
    },
});
