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
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import Video from 'react-native-video';
import AudioFile from '../../../assets/image/better-day-186374.mp3';
import { createThumbnail } from 'react-native-create-thumbnail';
import messaging from '@react-native-firebase/messaging';
import { Swipeable } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';

const PersonalChats = ({ navigation, route }) => {

    const { User } = route.params;
    console.log("user data from params", User.id)
    const userData = useSelector(state => state.userData)
    console.log("userData from redux", userData.id)
    const chatRoomRef = useRef(null);

    const [isFullScreen, setIsFullScreen] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);

    const swipeRef = useRef(null);
    const [swiped, setSwiped] = useState(false);
    const [swipedMessage, setSwipedMessage] = useState(null);
    const [swipedMessageId, setSwipedMessageId] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [selectedMessageId, setSelectedMessageId] = useState(null);

    // Function to handle long-press on messages
    const handleLongPress = (messageId) => {
        setSelectedMessageId(messageId);
    };


    // Function to delete the selected message
    const deleteSelectedMessage = () => {
        if (selectedMessageId) {
            // Filter out the selected message from the messages array
            const updatedMessages = messages.filter(message => message._id !== selectedMessageId);
            setMessages(updatedMessages);
            setSelectedMessageId(null); // Clear the selected message ID
        }
    };

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
                return gestureState.dy > 5; // Set the threshold for swipe down
            },
            onPanResponderRelease: (evt, gestureState) => {
                if (gestureState.dy > 50) { // If the swipe distance is greater than 50 (adjust as needed)
                    closeFullScreen();
                }
            },
        })
    ).current;

    const toggleFullScreen = (videoUri) => {
        setIsFullScreen(!isFullScreen);
        setSelectedVideo(videoUri);
    };

    const closeFullScreen = () => {
        setIsFullScreen(false);
    };

    const handleTyping = (text) => {
        // Check if the text input is empty or not
        setIsTyping(text.length > 0);
    };

    useEffect(() => {
        const db = firestore();
        const chatRoomId = userData.id < User.id
            ? `${userData.id}_${User.id}`
            : `${User.id}_${userData.id}`;
    
        console.log("Chat Room ID:", chatRoomId); // Log chatRoomId for debugging
        console.log("Current User ID:", userData.id); // Log current user ID
        console.log("Other User ID:", User.id); // Log other user ID
    
        chatRoomRef.current = db.collection('chatRooms').doc(chatRoomId);
    
        const createChatRoom = async () => {
            try {
                const docSnapshot = await chatRoomRef.current.get();
    
                if (!docSnapshot.exists) {
                    // Create the chat room with the correct 'users' array
                    await chatRoomRef.current.set({
                        createdAt: firestore.FieldValue.serverTimestamp(),
                        users: [userData.id, User.id], // Ensure 'users' array is set
                        messages: [],
                    });
                    console.log('Chat room created successfully');
                } else {
                    console.log('Chat room already exists');
                }
            } catch (error) {
                if (error.code === 'firestore/permission-denied') {
                    console.error('Permission denied. Please check Firestore rules.', error);
                } else {
                    console.error('Error fetching or creating chat room:', error);
                }
            }
        };
    
        createChatRoom();
    
        // Subscribe to FCM topic for real-time notifications
        messaging().subscribeToTopic(chatRoomId).catch((error) => {
            console.error('Error subscribing to topic:', error);
        });
    
        // Cleanup: Unsubscribe from FCM topic when component unmounts
        return () => {
            messaging().unsubscribeFromTopic(chatRoomId).catch((error) => {
                console.error('Error unsubscribing from topic:', error);
            });
        };
    }, [User.id, userData.id]);
    

    const [messages, setMessages] = useState([]);

    const selectMedia = (type) => {
        let pickerOptions = {};
        if (type === 'photo') {
            pickerOptions = {
                cropping: true,
            };
        } else if (type === 'video') {
            pickerOptions = {
                mediaType: 'video',
            };
        } else if (type === 'audio') {
            pickerOptions = {
                mediaType: 'audio',
            };
        }

        ImagePicker.openPicker(pickerOptions).then(async (response) => {
            if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else {
                const source = { uri: response.path };
                // Check the type of the selected media and send the appropriate URL
                if (type === 'photo') {
                    onSend([{ _id: Math.random().toString(), image: source.uri }]);
                } else if (type === 'video') {
                    // Generate the video thumbnail
                    const thumbnail = await generateVideoThumbnail(source.uri);
                    // Send the video URI and thumbnail
                    onSend([{ _id: Math.random().toString(), video: source.uri, videoThumbnail: thumbnail }]);
                } else if (type === 'audio') {
                    onSend([{ _id: Math.random().toString(), audio: source.uri }]);
                }
            }
        });
    };

    // const generateVideoThumbnail = async (videoUri) => {
    //     try {
    //         const thumbnail = await createThumbnail({
    //             url: videoUri,
    //             timeStamp: 1000, // Specify the time in milliseconds for the thumbnail
    //         });
    //         return thumbnail.path;
    //     } catch (e) {
    //         console.error('Error generating video thumbnail:', e);
    //         return null;
    //     }
    // };


    // useEffect(() => {
    //     const unsubscribe = chatRoomRef.current.collection('messages')
    //         .orderBy('createdAt', 'desc')
    //         .onSnapshot((snapshot) => {
    //             const messages = snapshot.docs.map((doc) => {
    //                 const data = doc.data();
    //                 const { _id, text, image, videoThumbnail, video, audio, createdAt, user } = data;
    //                 const message = {
    //                     _id,
    //                     text,
    //                     image,
    //                     videoThumbnail,
    //                     video,
    //                     audio,
    //                     createdAt: createdAt ? createdAt.toDate() : new Date(), // Use the current date as a default value
    //                     user: {
    //                         ...user,
    //                         _id: user._id, // Set the _id to the randomNumber of the user who sent the message
    //                     },
    //                 };
    //                 return message;
    //             });
    //             setMessages((messages));
    //             sendPushNotification(messages);
    //         });

    //     return () => unsubscribe();
    // }, [User.randomNumber, userData.randomNumber]);


    const onSend = useCallback((newMessages = []) => {
        newMessages.forEach(async (message) => {
            // Check if the message contains media
            if (message.image) {
                // Upload the media to Firebase Storage and get the download URL
                const reference = storage().ref(message.image);
                await reference.putFile(message.image);
                const url = await reference.getDownloadURL();
                console.log('Media URL:', url);

                // Add the download URL to the message object
                message.image = url;
            } else if (message.video) {
                // Upload the media to Firebase Storage and get the download URL
                const reference = storage().ref(message.video);
                await reference.putFile(message.video);
                const url = await reference.getDownloadURL();
                console.log('Media URL:', url);

                // Add the download URL to the message object
                message.video = url;
            } else if (message.audio) {
                // Upload the media to Firebase Storage and get the download URL
                const reference = storage().ref(message.audio);
                await reference.putFile(message.audio);
                const url = await reference.getDownloadURL();
                console.log('Media URL:', url);

                // Add the download URL to the message object
                message.audio = url;
            }

            // Check if userData is not null before trying to access its properties
            if (userData) {
                console.log(userData.name);

                chatRoomRef.current.collection('messages').add({
                    ...message,
                    user: {
                        _id: userData.randomNumber,
                        name: userData.name,
                        avatar: userData.photoUrl,
                    },
                    createdAt: firestore.FieldValue.serverTimestamp(),
                });
            } else {
                console.error('userData is null');
            }
        });

        messages.forEach(message => {
            console.log(message);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userData, userData.randomNumber]);

    // Function to send push notifications for new messages
    const sendPushNotification = async (messages) => {
        try {
            if (messages.length > 0) {
                const lastMessage = messages[0];
                if (lastMessage.user._id !== userData.randomNumber) {
                    // If the last message is not sent by the current user, send a push notification
                    await messaging().sendToDevice(User.fcmToken, {
                        notification: {
                            title: 'New Message',
                            body: `${lastMessage.user.name}: ${lastMessage.text}`,
                        },
                    });
                }
            }
        } catch (error) {
            console.error('Error sending push notification:', error);
        }
    };

    const renderSend = (props) => (
        <TouchableOpacity onPress={() => onSend(props)}>
            <Send {...props}>
                <View style={{ borderRadius: wp(2) }}>
                    <View
                        style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: wp(12),
                            width: wp(12),
                            borderRadius: wp(12),
                            // borderWidth: 1,
                            // borderColor: COLORS.gray,
                            backgroundColor: COLORS.lightGreen,
                            marginRight: wp(1),
                            // marginBottom: 5,
                        }}
                    >
                        <FontAwesome name="send" size={18} color={COLORS.white} />
                    </View>
                </View>
            </Send>
        </TouchableOpacity>
    );

    const renderInputToolbar = (props) => {
        const { swipedMessage, onSendReply } = props;
        return (
            <InputToolbar
                {...props}
                containerStyle={{
                    borderTopWidth: 0,
                    backgroundColor: 'transparent',
                    marginBottom: hp(0.5),
                }}
                primaryStyle={{ justifyContent: 'center' }}
            >
                {swipedMessage && (
                    <View style={styles.replyComponent}>
                        {/* Render the reply component with swiped message text and text input */}
                        <Composer
                            text={swipedMessage.text}
                            onChangeText={(text) => setSwipedMessage({ ...swipedMessage, text })}
                            placeholder="Type your reply here..."
                            multiline
                        />
                        <Send onPress={() => onSendReply(swipedMessage)} />
                    </View>
                )}
                <Composer
                    {...props}
                    textInputStyle={{
                        backgroundColor: COLORS.black,
                        color: COLORS.secondaryBlack,
                        borderRadius: wp(2),
                        borderWidth: 1,
                        borderColor: COLORS.gray,
                        marginRight: wp(2),
                        paddingHorizontal: 12,
                    }}
                />
                <Send {...props} />
                <renderActions {...props} />
            </InputToolbar>
        );
    };

    const CustomActions = (props) => {
        return (
            <FontAwesome name="camera" size={24} color="black" />
        );
    };

    const renderActions = (props) => (
        <Actions
            {...props}
            options={{
                'Choose From Library': () => selectMedia('photo'),
                'Choose Video': () => selectMedia('video'),
                'Record Audio': () => selectMedia('audio'),
            }}
            icon={() => <CustomActions />}
        />
    );

    const renderMessageImage = (props) => {
        return (
            <MessageImage
                {...props}

            />
        );
    };

    const renderMessageVideo = (props) => {
        const { currentMessage } = props;
        return (
            <TouchableOpacity onPress={() => toggleFullScreen(currentMessage.video)}>
                <View style={{
                    width: wp(70),
                    height: hp(20),
                    borderRadius: wp(4),
                    borderTopRightRadius: wp(0),
                    borderBottomRightRadius: wp(6),
                    borderTopLeftRadius: wp(4),
                    borderBottomLeftRadius: wp(0),
                    overflow: 'hidden', // Ensure the play icon is not overflowing
                }}>
                    <Image
                        source={{ uri: currentMessage.videoThumbnail }}
                        style={{
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                        }}
                    />
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: [{ translateX: -15 }, { translateY: -20 }], // Center the play icon
                        }}
                        onPress={() => toggleFullScreen(currentMessage.video)}
                    >
                        <FontAwesome name="play-circle" size={hp(6)} color="white" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    }


    const renderBubble = (props) => {
        const { currentMessage } = props;
        // console.log('Current Message:', currentMessage);
        // Add debugging logs if needed
        // console.log('Rendering bubble for currentMessage:', currentMessage.image);



        const bubbleStyle = {
            right: {
                backgroundColor: COLORS.green, // WhatsApp green color for sent messages
                borderRadius: wp(4),
                borderTopRightRadius: wp(0),
                borderBottomRightRadius: wp(6),
                borderTopLeftRadius: currentMessage.image ? wp(4) : wp(6),
                borderBottomLeftRadius: wp(0),
                marginVertical: hp(1),
            },
            left: {
                backgroundColor: COLORS.white, // White color for received messages
                borderRadius: wp(4),
                borderTopLeftRadius: wp(6),
                marginVertical: hp(1),
            },
        };

        const textStyle = {
            right: {
                color: COLORS.black, // Black color for text in sent messages
            },
            left: {
                color: COLORS.black, // Black color for text in received messages
            },
        };

        const handleSwipe = (messageId) => {
            if (!swipedMessageId) {
                // Perform actions when the message is swiped
                console.log('Message swiped:', messageId, currentMessage.text);
                setSwipedMessageId(messageId);
                setSwipedMessage(currentMessage);
            }
        };

        const renderLeftActions = (progress, dragX, messageId) => {
            const trans = dragX.interpolate({
                inputRange: [0, 100],
                outputRange: [0, 1],
                extrapolate: 'clamp',
            });

            return (
                <Animated.View
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        transform: [{ translateX: trans }],
                    }}
                >
                    {/* Add your custom reply icon here */}
                    <MaterialCommunityIcons name="reply-outline" color={COLORS.darkgray1} size={hp(5)} />
                </Animated.View>
            );
        };

        return (
            <Swipeable
                renderLeftActions={(progress, dragX) =>
                    renderLeftActions(progress, dragX, currentMessage._id, currentMessage)
                }
                onSwipeableLeftOpen={() => handleSwipe(currentMessage._id, currentMessage)}
                onSwipeableClose={() => {
                    if (swipedMessageId === currentMessage._id) {
                        // Reset swipedMessageId when the swipe is closed
                        setSwipedMessageId(null);
                    }
                }}
            >
                <Bubble
                    {...props}
                    wrapperStyle={bubbleStyle}
                    textStyle={textStyle}
                >
                    {currentMessage.image && renderMessageImage({ ...props, currentMessage })}
                    {currentMessage.video && renderMessageVideo({ ...props, currentMessage })}
                    {currentMessage.audio && (
                        <MessageAudio
                            {...props}
                            audioStyle={{ width: wp(100) }} // Adjust as needed
                        />
                    )}

                </Bubble>
            </Swipeable>
        );
    };


    return (
        <ImageBackground source={require('../../../assets/image/wallpaper.webp')}
            style={{ flex: 1 }} resizeMode="cover">
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                    {isFullScreen ? (
                        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                            <TouchableOpacity onPress={closeFullScreen} style={{ position: 'absolute', top: hp(1), right: wp(3), zIndex: 999 }}>
                                <AntDesign name="closecircle" size={hp(4)} color={COLORS.white} />
                            </TouchableOpacity>
                            <Animated.View {...panResponder.panHandlers} style={{ flex: 1 }}>
                                <Video
                                    source={{ uri: selectedVideo }}
                                    style={{ width: '100%', height: '100%' }}
                                    controls={true}
                                    fullscreen={true}
                                />
                            </Animated.View>
                        </View>


                    ) : (
                        <>

                            <View
                                style={styles.header}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <TouchableOpacity
                                        onPress={() => navigation.goBack()}
                                        style={{ marginLeft: -10 }}
                                    >
                                        <AntDesign
                                            name="arrowleft"
                                            size={24}
                                            style={{ color: COLORS.secondaryWhite }}
                                        />
                                    </TouchableOpacity>
                                    <Image
                                        source={{ uri: User.photoUrl }}
                                        style={{
                                            height: wp(10),
                                            width: wp(10),
                                            borderRadius: wp(10),
                                            marginLeft: 5,
                                        }}
                                    />

                                    <Text style={{ marginLeft: wp(2), color: COLORS.secondaryWhite, fontFamily: fontFamily.FONTS.regular, fontSize: hp(2.5) }}>{User.name}</Text>
                                </View>
                                {selectedMessageId ? null : ( // Render icons only if no message is selected
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <TouchableOpacity style={{ marginRight: wp(5) }}>
                                            <Ionicons name="videocam" size={22} style={{ color: COLORS.secondaryWhite }} />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={{ marginRight: wp(5) }} onPress={() => navigation.navigate('VoiceCall', { UserData: User })}>
                                            <MaterialIcons name="call" size={22} style={{ color: COLORS.secondaryWhite }} />
                                        </TouchableOpacity>
                                        <TouchableOpacity>
                                            <Entypo name="dots-three-vertical" size={22} style={{ color: COLORS.secondaryWhite }} />
                                        </TouchableOpacity>
                                    </View>
                                )}
                                {selectedMessageId ? ( // Render delete icon only if a message is selected
                                    <TouchableOpacity onPress={deleteSelectedMessage}>
                                        <FontAwesome name="trash-o" size={22} color="white" />
                                    </TouchableOpacity>
                                ) : null}
                            </View>


                            <GiftedChat
                                messages={messages}
                                onSend={newMessages => onSend(newMessages)}
                                user={{
                                    _id: userData.id, // This should be the current user's ID
                                }}
                                alwaysShowSend
                                renderSend={renderSend}
                                renderActions={renderActions}
                                renderInputToolbar={renderInputToolbar}
                                renderBubble={renderBubble}

                                renderMessageAudio={props => {
                                    // const { currentMessage } = props;
                                    return (
                                        <Video
                                            source={AudioFile}
                                            style={{ width: 100, height: 50 }}
                                            controls={true}
                                        />
                                    );
                                }}
                                renderMessageVideo={props => {
                                    const { currentMessage } = props;
                                    return (
                                        <TouchableOpacity onPress={() => toggleFullScreen(currentMessage.video)}>
                                            <View style={{
                                                width: wp(70),
                                                height: hp(20),
                                                borderRadius: wp(4),
                                                borderTopRightRadius: wp(0),
                                                borderBottomRightRadius: wp(6),
                                                borderTopLeftRadius: wp(4),
                                                borderBottomLeftRadius: wp(0),
                                                overflow: 'hidden', // Ensure the play icon is not overflowing
                                            }}>
                                                <Image
                                                    source={{ uri: currentMessage.videoThumbnail }}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        position: 'absolute',
                                                    }}
                                                />
                                                <TouchableOpacity
                                                    style={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        left: '50%',
                                                        transform: [{ translateX: -15 }, { translateY: -20 }], // Center the play icon
                                                    }}
                                                    onPress={() => toggleFullScreen(currentMessage.video)}
                                                >
                                                    <FontAwesome name="play-circle" size={hp(6)} color="white" />
                                                </TouchableOpacity>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                }}
                                isTyping={messages.some(message => message.user._id !== userData.id && message.isTyping)}
                                onInputTextChanged={handleTyping}
                                scrollToBottom
                                showAvatarForEveryMessage={true}
                                renderUsernameOnMessage={true}
                                onLongPress={handleLongPress}
                                onMoveShouldSetPanResponderCapture={true}
                                textInputStyle={{
                                    borderRadius: wp(8),
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 3.84,
                                    elevation: 0.4,
                                    marginRight: wp(1),
                                    paddingHorizontal: wp(3),
                                    backgroundColor: COLORS.white,
                                    color: COLORS.black,
                                }}
                                timeTextStyle={{ left: { color: COLORS.secondaryBlack }, right: { color: COLORS.secondaryBlack } }}
                                style={{ backgroundColor: COLORS.secondaryBlack }}
                            // inverted={false} // Add this li
                            />
                        </>
                    )}
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
};

export default PersonalChats;

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: wp(4),
        backgroundColor: COLORS.lightGreen,
        height: hp(7.5),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 1,
        alignItems: 'center',
    },
    inputToolbar: {
        borderRadius: 22,
        borderWidth: 1,
        borderColor: COLORS.gray,
        marginRight: 6,
        paddingHorizontal: 12,
        backgroundColor: COLORS.white,
        color: COLORS.black,
    },
    inputToolbarPrimary: {
        backgroundColor: '#FFF',
    },
    textInput: {
        fontFamily: fontFamily.FONTS.regular,
        fontSize: hp(2),
        paddingHorizontal: wp(2),
    },
    sendButtonContainer: {
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
        width: 45,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: COLORS.gray,
        backgroundColor: COLORS.darkGreeen,
        marginRight: 10,
        // marginBottom: 5,
    },
    sendButtonText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    replyComponent: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 10,
        marginTop: 10,
    },
});
