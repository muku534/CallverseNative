/* eslint-disable prettier/prettier */

/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import COLORS from '../../constants/colors';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from './Pixel/Index';
import { Loader } from './Loader';

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
            onPress={props.onPress} disabled={props.disabled || props.loading}
        >
            {props.loading ? (
                <Loader isLoading={props.loading} color={COLORS.secondaryWhite} />
            ) : (
                <Text style={{ color: COLORS.white, fontWeight: '700', fontSize: hp(2.2) }}>{props.title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        height: hp(5.8),
        // paddingBottom: 16,
        // paddingVertical: 10,
        borderColor: COLORS.primary,
        // borderWidth: 2,
        borderRadius: wp(7),
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.80,
        elevation: 1,
    },
});
export default Button;
