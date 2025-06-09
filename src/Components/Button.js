/* eslint-disable prettier/prettier */

/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import COLORS from '../../constants/colors';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from './Pixel/Index';
import { Loader } from './Loader';
import fontFamily from '../../constants/fontFamily';

const Button = (props) => {
    const filledBgColor = props.color || COLORS.primary;
    const outlinedColor = COLORS.white;
    const bgColor = props.filled ? filledBgColor : outlinedColor;
    const textColor = props.filled ? COLORS.white : COLORS.primary;
    const buttonTextColor = props.disabled ? COLORS.gray : COLORS.white;

    return (
        <TouchableOpacity
            style={{
                ...styles.button,
                ...{ backgroundColor: COLORS.lightGreen },
                ...props.style,
            }}
            activeOpacity={0.7}
            onPress={props.onPress} disabled={props.disabled || props.loading}
        >
            {props.loading ? (
                <Loader isLoading={props.loading} color={COLORS.secondaryWhite} />
            ) : (
                <Text style={{ color: COLORS.white, fontFamily: fontFamily.FONTS.bold, fontSize: hp(2.2) }}>{props.title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        height: hp(5.8),
        width: wp(90),
        borderRadius: wp(4),
        marginHorizontal: wp(0),
        alignItems: 'center',
        justifyContent: 'center',
    },
});
export default Button;
