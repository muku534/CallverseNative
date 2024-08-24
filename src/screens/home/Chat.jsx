/* eslint-disable prettier/prettier */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import { SafeAreaView, StatusBar, StyleSheet, TouchableOpacity, TextInput, Text, View, Image, FlatList } from 'react-native';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { COLORS } from '../../../constants';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from '../../Components/Pixel/Index';
import fontFamily from '../../../constants/fontFamily';
import user1Image from '../../../assets/image/user1.jpg';
import user2Image from '../../../assets/image/user2.jpg';
import user3Image from '../../../assets/image/user3.jpg';
import user4Image from '../../../assets/image/user4.jpg';
import user5Image from '../../../assets/image/user5.jpg';
import user6Image from '../../../assets/image/user6.jpg';
import user7Image from '../../../assets/image/user7.jpg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Iconics from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import Entypo from 'react-native-vector-icons/Entypo';

const Chats = ({ navigation }) => {

    const [searchVisible, setSearchVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filteredChats, setFilteredChats] = useState([]);
 
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

        </SafeAreaView>
    );
};

export default Chats;

const styles = StyleSheet.create({});
