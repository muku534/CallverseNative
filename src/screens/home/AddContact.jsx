/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
import { View, Text, SafeAreaView, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert, ToastAndroid, StatusBar } from 'react-native';
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
import { CommonActions } from '@react-navigation/native';

const AddContact = ({ navigation }) => {
    const dispatch = useDispatch();
    const [contactName, setContactName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const userData = useSelector(state => state.userData)
    console.log("userId", userData.id)
    const [loading, setLoading] = useState(false)

    const checkUserByPhoneNumber = async (phoneNumber) => {
        try {
            // Log the phone number to verify it’s correct
            console.log('Checking phone number:', phoneNumber);

            // Convert phoneNumber to a number if stored as a number in Firestore
            const numberPhoneNumber = Number(phoneNumber);

            // Query the Users collection for a document with the given phone number
            const querySnapshot = await firestore()
                .collection('Users')
                .where('randomNumber', '==', numberPhoneNumber)
                .get();

            // Log the query result to see what is returned
            console.log('Query Snapshot:', querySnapshot.empty ? 'No documents found' : 'Documents found');
            querySnapshot.docs.forEach(doc => console.log('Document ID:', doc.id, 'Data:', doc.data()));

            // If a matching document is found, retrieve the user data
            if (!querySnapshot.empty) {
                // Get the first document in the result
                const userDoc = querySnapshot.docs[0];

                // Retrieve the document data
                const contactData = userDoc.data();
                console.log('User Data:', contactData); // Log the user data to see what is returned

                // Extract the fields you need
                const uid = userDoc.id;
                const { photoUrl, email, fcmToken } = contactData;

                // Log the results for debugging
                console.log('User ID:', uid);
                console.log('User Data:', contactData);

                // Return the user data along with the document ID
                return { uid, photoUrl, email, fcmToken };
            } else {
                Alert.alert('User not found');
                return null;
            }
        } catch (error) {
            console.error('Error checking user:', error);
            Alert.alert('Error checking user');
            return null;
        }
    };

    const saveContact = async () => {
        setLoading(true)
        if (!contactName || !phoneNumber) {
            ToastAndroid.show('Please enter name and number', ToastAndroid.SHORT);
            return;
        }
        try {
            // Check if the phone number exists in the Users collection
            const existingUserData = await checkUserByPhoneNumber(phoneNumber);

            if (existingUserData) {
                // If user exists, get their data
                console.log("existingUserData", existingUserData)
                const newContact = {
                    id: existingUserData.uid,
                    name: contactName,
                    randomNumber: phoneNumber,
                    photoUrl: existingUserData.photoUrl, // Use the found user's photoUrl
                    email: existingUserData.email, // You can store more data if needed
                    fcmToken: existingUserData.fcmToken
                };

                const contactRef = firestore().collection('Contacts').doc(userData.id);
                const contactDoc = await contactRef.get();

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
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'TabStack' }],
                    })
                );
                Alert.alert('Contact saved successfully');
                setContactName('');
                setPhoneNumber('');
                dispatch(addContact(newContact));
            }
        } catch (error) {
            console.error('Error saving contact:', error);
            Alert.alert('Error saving contact');
        } finally {
            setLoading(false)
        }
    };

    return (
        <SafeAreaView>
            <StatusBar backgroundColor={COLORS.tertiaryWhite} barStyle="dark-content" />
            <View style={{ backgroundColor: COLORS.tertiaryWhite, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: hp(6), padding: wp(2), }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <AntDesign name="arrowleft" size={hp(3)} color={COLORS.black} />
                    <Text style={{ fontFamily: fontFamily.FONTS.bold, color: COLORS.primarygreen, fontSize: hp(3), fontWeight: '700', marginHorizontal: wp(2) }}>Add Contact</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.divider} />

            <ScrollView>
                <View style={styles.container}>
                    <View style={styles.formContainer}>
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

                        <Button
                            title="Save"
                            // filled
                            onPress={() => saveContact()}
                            style={{
                                marginVertical: hp(4),
                            }}
                            loading={loading}
                        />

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
    divider: {
        width: '100%',
        height: 0.4,
        backgroundColor: COLORS.gray, // Adjust color as needed
        // marginVertical: hp(0.5), // Spacing around the divider
    },
});

export default AddContact;

