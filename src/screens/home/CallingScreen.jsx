import { Image, StyleSheet, View } from 'react-native';
import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import {
    ZegoUIKitPrebuiltCall,
    ONE_ON_ONE_VIDEO_CALL_CONFIG,
    ONE_ON_ONE_VOICE_CALL_CONFIG,
    ZegoMenuBarButtonName,
} from '@zegocloud/zego-uikit-prebuilt-call-rn';

const CallingScreen = ({ navigation, route }) => {
    const { recipientUserID, callType } = route.params;
    const userData = useSelector(state => state.userData);

    // Validate userData and recipientUserID to prevent errors
    if (!userData || !recipientUserID) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>

            <ZegoUIKitPrebuiltCall
                appId={'764734898'}
                appSign={'5e9d9a3949268c764f27c583ed3ec4993c003e47ed4ad14fc7e47ccdbbee75a7'}
                userID={userData.id}
                userName={userData.displayName}
                callID={`${userData.id} _${recipientUserID} _call`}

                config={{
                    // You can also use ONE_ON_ONE_VOICE_CALL_CONFIG/GROUP_VIDEO_CALL_CONFIG/GROUP_VOICE_CALL_CONFIG to make more types of calls.
                    ...ONE_ON_ONE_VIDEO_CALL_CONFIG,
                    onCallEnd: (callID, reason, duration) => { props.navigation.navigate('HomePage') },
                }}
            />
        </View>
    );
}

export default CallingScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 0,
    },
});