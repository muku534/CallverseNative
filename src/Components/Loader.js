/* eslint-disable prettier/prettier */
import React from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import {COLORS} from '../../constants';

export function Loader({isLoading = false, color = COLORS.white}) {
  if (!isLoading) return null;

  return (
    <View style={[styles.container]}>
      <ActivityIndicator color={color} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '90%',
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(0,0,0,0.5)'
  },
});
