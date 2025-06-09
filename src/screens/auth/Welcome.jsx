/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import { View, Text, Image, Alert, StyleSheet, TouchableOpacity, StatusBar, Modal } from 'react-native';
import React, { useEffect, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import COLORS from '../../../constants/colors';
import Button from '../../Components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from '../../Components/Pixel/Index';
import fontFamily from '../../../constants/fontFamily';
import Animated, { FadeInDown } from 'react-native-reanimated';

const Welcome = ({ navigation }) => {
    const [generatedNumber, setGeneratedNumber] = useState(false);
    const [randomNumber, setRandomNumber] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

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
                setModalMessage(`Your generated number is ${newNumber}`);
                setModalVisible(true);
            } catch (error) {
                console.log('Error generating and storing number:', error);
            }
        } else {
            setModalMessage('You have already generated a number.');
            setModalVisible(true);
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
            <StatusBar backgroundColor={COLORS.secondary} barStyle="light-content" />
            <View style={styles.container}>
                <View>
                    <Animated.View
                        entering={FadeInDown.delay(50)}
                    >
                        <Image
                            source={require('../../../assets/image/hero1.jpg')}
                            style={styles.image1}
                        />
                    </Animated.View>

                    <Animated.View
                        entering={FadeInDown.delay(100)}
                    >
                        <Image
                            source={require('../../../assets/image/hero3.jpg')}
                            style={styles.images2}
                        />
                    </Animated.View>

                    <Animated.View
                        entering={FadeInDown.delay(200)}
                    >
                        <Image
                            source={require('../../../assets/image/hero3.jpg')}
                            style={styles.images3}
                        />
                    </Animated.View>

                    <Animated.View
                        entering={FadeInDown.delay(300)}
                    >
                        <Image
                            source={require('../../../assets/image/hero2.jpg')}
                            style={styles.image4}
                        />
                    </Animated.View>
                </View>

                {/* content  */}
                <Animated.View
                    entering={FadeInDown.delay(400)}
                    style={styles.contentContainer}
                >
                    <Animated.Text
                        entering={FadeInDown.delay(500)}
                        style={styles.text}
                    >
                        Welcome to Callverse!
                    </Animated.Text>

                    <View style={styles.sloganContainer}>
                        <Animated.Text
                            entering={FadeInDown.delay(600)}
                            style={styles.sloganText}
                        >
                            Chat freely, call instantly.
                        </Animated.Text>
                        <Animated.Text
                            entering={FadeInDown.delay(700)}
                            style={styles.sloganText}
                        >
                            Your privacy, our priority.
                        </Animated.Text>
                        <Animated.Text
                            entering={FadeInDown.delay(800)}
                            style={styles.sloganText}
                        >
                            Experience secure, modern messaging.
                        </Animated.Text>
                    </View>

                    <Animated.View entering={FadeInDown.delay(900)}>
                        <Button
                            title="Join the Conversation"
                            onPress={generateAndStoreNumber}
                        />
                    </Animated.View>

                    <View style={styles.linkContainer}>
                        <Animated.Text
                            entering={FadeInDown.delay(1000)}
                            style={styles.linkText}
                        >
                            Already have an account?
                        </Animated.Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Animated.Text
                                entering={FadeInDown.delay(1100)}
                                style={styles.link}
                            >
                                Login
                            </Animated.Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>

            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Welcome to Callverse</Text>
                        <Text style={styles.modalMessage}>{modalMessage}</Text>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => {
                                setModalVisible(false);
                                if (!generatedNumber) return;
                                navigation.navigate('AddProfile', { randomNumber });
                            }}
                        >
                            <Text style={styles.modalButtonText}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </LinearGradient>
    );
};

export default Welcome;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    image1: {
        height: hp(14),
        width: wp(28),
        borderRadius: wp(4),
        position: 'absolute',
        left: wp(5),
        top: hp(2),
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
        top: hp(-4),
        left: wp(35),
        transform: [
            { translateX: 50 },
            { translateY: 50 },
            { rotate: '-10deg' },
        ],
    },
    images3: {
        height: hp(14),
        width: wp(28),
        borderRadius: wp(4),
        position: 'absolute',
        top: hp(20),
        left: wp(-8),
        transform: [
            { translateX: 50 },
            { translateY: 50 },
            { rotate: '15deg' },
        ],
    },
    image4: {
        height: hp(25),
        width: wp(50),
        borderRadius: wp(4),
        position: 'absolute',
        top: hp(15),
        left: wp(35),
        transform: [
            { translateX: 50 },
            { translateY: 50 },
            { rotate: '-15deg' },
        ],
    },

    contentContainer: {
        marginHorizontal: wp(5),
        top: hp(55),
    },
    text: {
        fontSize: hp(4),
        fontFamily: fontFamily.FONTS.bold,
        color: COLORS.white,
    },
    sloganContainer: {
        marginVertical: hp(1),
        marginBottom: hp(4),
    },
    sloganText: {
        fontSize: hp(2.2),
        fontFamily: fontFamily.FONTS.Medium,
        lineHeight: hp(3.5),
        color: COLORS.white,
    },
    linkContainer: {
        flexDirection: 'row',
        marginTop: hp(4),
        marginBottom: hp(2),
        marginHorizontal: wp(8),
    },
    linkText: {
        fontFamily: fontFamily.FONTS.regular,
        fontSize: hp(2.2),
        color: COLORS.white,
    },
    link: {
        fontSize: hp(2.2),
        color: COLORS.white,
        fontFamily: fontFamily.FONTS.bold,
        marginLeft: wp(2),
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: COLORS.white,
        padding: wp(5.5),
        borderRadius: wp(5),
        width: wp(85),
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: hp(2.8),
        fontFamily: fontFamily.FONTS.bold,
        color: COLORS.primary,
        marginBottom: hp(1),
    },
    modalMessage: {
        fontSize: hp(2),
        fontFamily: fontFamily.FONTS.Medium,
        textAlign: 'center',
        color: COLORS.black,
        marginBottom: hp(2),
    },
    modalButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: hp(1.3),
        paddingHorizontal: wp(10),
        borderRadius: wp(2),
    },
    modalButtonText: {
        fontSize: hp(2),
        fontFamily: fontFamily.FONTS.bold,
        color: COLORS.white,
    },

});
