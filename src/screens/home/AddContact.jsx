/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
import { View, Text, SafeAreaView, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../../constants';
import Button from '../../Components/Button';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from '../../Components/Pixel/Index';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import fontFamily from '../../../constants/fontFamily';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { addContact } from '../../redux/action';

const AddContact = () => {
    const dispatch = useDispatch();
    const [contactName, setContactName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const userData = useSelector(state => state.userData)

    const saveContact = async () => {
        if (!userData || !userData.id) {
            Alert.alert('User not found');
            return;
        }

        try {
            const contactRef = firestore().collection('Contacts').doc(userData.id);
            const contactDoc = await contactRef.get();

            const newContact = {
                name: contactName,
                randomNumber: phoneNumber,
                // profileImage: userData.profileImage,
                // bio: userData.bio,
            };

            if (contactDoc.exists) {
                // If the document exists, update it
                await contactRef.update({
                    contacts: firestore.FieldValue.arrayUnion(newContact),
                });
            } else {
                // If the document doesn't exist, create it
                await contactRef.set({
                    contacts: [newContact],
                });
            }

            Alert.alert('Contact saved successfully');
            setContactName('');
            setPhoneNumber('');
            dispatch(addContact(newContact));
        } catch (error) {
            console.error('Error saving contact:', error);
            Alert.alert('Error saving contact');
        }
    };

    return (
        <SafeAreaView>
            <ScrollView>
                <View style={styles.container}>
                    <View style={styles.formContainer}>
                        {/* <Text style={{
                    fontSize: 16,
                    fontWeight: '400',
                    marginTop: 22,
                }}>Display name</Text> */}

                        <View style={styles.inputContainer}>
                            <FontAwesome name="user" size={hp(3)} color={COLORS.secondaryGray} style={{ marginHorizontal: 10 }} />
                            <TextInput
                                placeholder="Name"
                                placeholderTextColor={COLORS.secondaryGray}
                                keyboardType="default"
                                style={styles.TextInput}
                                value={contactName}
                                onChangeText={text => setContactName(text)}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="call" size={hp(3)} color={COLORS.secondaryGray} style={{ marginHorizontal: 10 }} />

                            <TextInput
                                placeholder="Enter the Number"
                                placeholderTextColor={COLORS.secondaryGray}
                                keyboardType="numeric"
                                style={styles.TextInput}
                                value={phoneNumber}
                                onChangeText={text => setPhoneNumber(text)}
                                maxLength={10}
                            />
                        </View>

                        <View style={{ marginTop: hp(5) }}>
                            <TouchableOpacity style={{ backgroundColor: COLORS.lightGreen, alignItems: 'center', justifyContent: 'center', borderRadius: wp(7) }} onPress={() => saveContact()}>
                                <Text style={{ padding: hp(1.5), fontFamily: fontFamily.FONTS.Medium, fontSize: hp(2.2), color: COLORS.tertiaryWhite }}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    formContainer: {
        width: '100%',
        paddingHorizontal: wp(7),
        marginTop: hp(2),
    },
    inputContainer: {
        width: '95%',
        // height: hp(6),
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginVertical: hp(2),
    },
    TextInput: {
        width: '100%',
        height: hp(6),
        fontSize: hp(2),
        borderRadius: wp(2),
        backgroundColor: COLORS.secondaryWhite,
        color: '#111',
        justifyContent: 'center',
        alignItems: 'center',
    },

});

export default AddContact;

