/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import { View, Text, Pressable, Image, Alert, SafeAreaView, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, TextInput, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import COLORS from '../../../constants/colors';
import { FONTS, SIZES, images } from '../../../constants';
import Button from '../../Components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from '../../Components/Pixel/Index';
import firestore from '@react-native-firebase/firestore';
import { firebase } from '@react-native-firebase/firestore';

const Welcome = ({ navigation }) => {
    const [generatedNumber, setGeneratedNumber] = useState(false);
    const [randomNumber, setRandomNumber] = useState(null);

    const checkIfNumberGenerated = async () => {
        try {
            const flag = await AsyncStorage.getItem('generatedNumber');
            if (flag === 'true') {
                const storedNumber = await AsyncStorage.getItem('randomNumber');
                setRandomNumber(storedNumber);
                setGeneratedNumber(true);
            }
        } catch (error) {
            console.log('Error checking if number is generated:', error);
        }
    };

    const generateAndStoreNumber = async () => {
        if (!generatedNumber) {
            const newNumber = Math.floor(Math.random() * 9000000000) + 1000000000; // Generate a 10-digit random number
            try {
                await AsyncStorage.setItem('userData', newNumber.toString());
                const userData = await AsyncStorage.getItem('userData');
                console.log('User data:', userData);
                await AsyncStorage.setItem('generatedNumber', 'true');
                setRandomNumber(newNumber);
                setGeneratedNumber(true);

                // Store the generated number and other user details in Firestore
                const user = {
                    randomNumber: newNumber,
                    // userName: 'John Doe', // Replace with actual user name
                    // email: 'prajapatimukesh0111@gmail.com', // Replace with actual email
                    // gender: 'Male', // Replace with actual gender
                    // bio: 'This is a bio', // Replace with actual bio
                    // ...other fields
                };
                await firestore().collection('Users').doc(newNumber.toString()).set(user);

                Alert.alert('Generated Number', `Your generated number is ${newNumber}`, [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('AddProfile', { randomNumber: newNumber }), // Replace 'AddProfile' with the actual name of the screen
                    },
                ]);
            } catch (error) {
                console.log('Error generating and storing number:', error);
            }
        } else {
            Alert.alert('Number Already Generated', 'You have already generated a number.');
        }
    };

    const deleteNumber = async () => {
        try {
            await AsyncStorage.removeItem('randomNumber');
            await AsyncStorage.removeItem('generatedNumber');
            console.log('Number deleted successfully.');
            setRandomNumber(null);
            setGeneratedNumber(false);
        } catch (error) {
            console.log('Error deleting number:', error);
        }
    };


    // const getDocument = async () => {
    //     try {
    //         const documentSnapshot = await firestore()
    //             .collection('Users')
    //             .doc('3316634761')
    //             .get();

    //         console.log('User ID: ', documentSnapshot.id);
    //         console.log('User data: ', documentSnapshot.data());
    //     } catch (error) {
    //         console.log('Error retrieving document:', error);
    //     }
    // };

    // useEffect(() => {
    //     getDocument();
    // }, []);

    const handleDeleteNumber = () => {
        Alert.alert('Delete Number', 'Are you sure you want to delete the number?', [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {
                text: 'Delete',
                onPress: deleteNumber,
            },
        ]);
    };

    useEffect(() => {
        checkIfNumberGenerated();
    }, []);

    return (
        <LinearGradient colors={[COLORS.secondary, COLORS.primary]} style={{ flex: 1 }}>
            <SafeAreaView style={{ backgroundColor: COLORS.darkGreeen }}>
                <StatusBar backgroundColor={COLORS.lightGreen} barStyle="light-content" />
                <View style={styles.container}>
                    <View>
                        <Image
                            source={require('../../../assets/image/hero1.jpg')}
                            style={styles.image1}
                        />

                        <Image
                            source={require('../../../assets/image/hero3.jpg')}
                            style={styles.images2}
                        />

                        <Image
                            source={require('../../../assets/image/hero3.jpg')}
                            style={styles.images3}
                        />

                        <Image
                            source={require('../../../assets/image/hero2.jpg')}
                            style={styles.image4}
                        />
                    </View>

                    {/* content  */}

                    <View style={styles.contentContainer}>
                        <Text style={styles.text}>Let's Get Started</Text>
                        {/** <Text style={styles.text2}>Started</Text> */}

                        <View style={styles.sloganContainer}>
                            <Text style={styles.sloganText}>Connect with each other with chatting</Text>
                            <Text style={styles.sloganText}>Calling, Enjoy Safe and private texting</Text>
                        </View>

                        <Button
                            title="Join Now"
                            style={styles.Button}
                            onPress={generateAndStoreNumber}
                        />

                        {/* <Button onPress={handleDeleteNumber} title="Delete Number" /> */}

                        <View style={styles.linkContainer}>
                            <Text style={styles.lnikText}>Already have an account ?</Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Login')}
                            >
                                <Text style={styles.link}>Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
};

export default Welcome;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: COLORS.black,
        // color: COLORS.secondaryWhite,
    },
    image1: {
        height: hp(14),
        width: wp(28),
        borderRadius: wp(4),
        position: 'absolute',
        top: 10,
        transform: [
            { translateX: 20 },
            { translateY: 50 },
            { rotate: '-15deg' },
        ],
    },
    images2: {
        height: hp(14),
        width: wp(28),
        borderRadius: wp(4),
        position: 'absolute',
        top: -30,
        left: 100,
        transform: [
            { translateX: 50 },
            { translateY: 50 },
            { rotate: '-5deg' },
        ],
    },
    images3: {
        height: hp(14),
        width: wp(28),
        borderRadius: wp(4),
        position: 'absolute',
        top: 130,
        left: -50,
        transform: [
            { translateX: 50 },
            { translateY: 50 },
            { rotate: '15deg' },
        ],
    },
    image4: {
        height: hp(28),
        width: wp(56),
        borderRadius: wp(4),
        position: 'absolute',
        top: hp(15),
        left: wp(28),
        transform: [
            { translateX: 50 },
            { translateY: 50 },
            { rotate: '-15deg' },
        ],
    },

    contentContainer: {
        paddingHorizontal: wp(4),
        position: 'absolute',
        top: hp(56),
        width: '100%',
    },
    text: {
        fontSize: hp(6),
        lineHeight: hp(6),
        paddingRight: wp(10),
        fontWeight: '800',
        color: COLORS.white,
    },
    text2: {
        fontSize: hp(6),
        fontWeight: '800',
        // fontWeight: 800,
        color: COLORS.white,
    },
    sloganContainer: {
        marginVertical: hp(1),
    },
    sloganText: {
        fontSize: hp(2.2),
        lineHeight: hp(3.5),
        color: COLORS.white,
        // marginVertical: hp(1),
    },
    Button: {
        marginTop: hp(3.5),
        width: '100%',
    },
    linkContainer: {
        flexDirection: 'row',
        marginTop: hp(4),
        justifyContent: 'center',
    },
    lnikText: {
        fontSize: hp(2.2),
        color: COLORS.white,
    },
    link: {
        fontSize: hp(2.2),
        color: COLORS.white,
        fontWeight: 'bold',
        // fontWeight: "bold",
        marginLeft: wp(2),
    },
});
