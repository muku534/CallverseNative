import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity, Image, ImageBackground, PanResponder, Animated } from 'react-native';
import { GiftedChat, InputToolbar, Composer, Send, Actions, MessageContainer, MessageImage, Bubble, MessageAudio } from 'react-native-gifted-chat';
import { COLORS } from '../../../constants';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from '../../Components/Pixel/Index';
import fontFamily from '../../../constants/fontFamily';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import User1 from '../../../assets/image/user1.jpg';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Video from 'react-native-video';
import AudioFile from '../../../assets/image/better-day-186374.mp3';


const VoiceCall = ({ navigation, route }) => {
    const { UserData } = route.params;
    console.log('userData', UserData);
    return (
        <ImageBackground source={require('../../../assets/image/ChatBg.jpg')}
            style={{ flex: 1, resizeMode: 'cover' }}>

            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
                    <View style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <Image source={{ uri: UserData.photoUrl }}
                            resizeMode='cover'
                            style={{
                                height: wp(30),
                                width: wp(30),
                                borderRadius: wp(30),
                                // marginLeft: 5,
                            }} />
                    </View>
                    <View style={{
                        alignItems: 'center',
                        marginVertical: hp(2),
                        // paddingTop: 18
                    }}>
                        <Text style={{ fontSize: hp(2.3), color: COLORS.gray, }}>Calling</Text>
                    </View>
                    <View style={{
                        alignItems: 'center',
                    }}>
                        <Text style={{ fontSize: hp(4), color: COLORS.gray, fontWeight: 'bold' }}>{UserData.name}</Text>
                    </View>

                    {/* <View style={{ flexDirection: 'row',
                     justifyContent: 'space-evenly',
                      alignItems: 'center', 
                      backgroundColor: COLORS.secondaryGray, 
                      borderRadius: 50, 
                      marginHorizontal:55,
                      marginTop:120,
                      padding:8 }}>

                        <Ionicons name="videocam" size={30} color="white" />

                        <Ionicons name="person-add" size={25} color="white" />

                        <Ionicons name="recording" size={30} color="white" />

                        <FontAwesome name="wechat" size={30} color="white" />
                    </View> */}

                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        alignItems: 'center',
                        marginTop: hp(40),
                    }}>
                        <TouchableOpacity>
                            <View style={{
                                height: wp(14),
                                width: wp(14),
                                backgroundColor: COLORS.secondaryGray,
                                borderRadius: wp(14),
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Fontisto name="volume-up" size={hp(2.8)} color="white" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <View style={{
                                height: wp(20),
                                width: wp(20),
                                backgroundColor: 'red',
                                borderRadius: wp(20),
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <MaterialIcons name="call-end" size={hp(6)} color="white" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <View style={{
                                height: wp(14),
                                width: wp(14),
                                backgroundColor: COLORS.secondaryGray,
                                borderRadius: wp(14),
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Ionicons name="mic-off" size={hp(4)} color="white" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
};

export default VoiceCall;

const styles = StyleSheet.create({});
