import React, { useEffect } from 'react';
import { Image, SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { COLORS, Images } from '../../../../../constants';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp
} from '../../../../core/utils/Pixel/Index';
import LinearGradient from 'react-native-linear-gradient';

const Splash = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={COLORS.tertiaryWhite} barStyle="dark-content" />
            <View style={styles.logoContainer}>
                <Image source={Images.play_store_graphic} style={styles.logo} resizeMode="contain" />
            </View>
        </View>
    );
};

export default Splash;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        width: wp(80),
        height: hp(50),
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: wp(90),
        height: hp(90),
    },
});
