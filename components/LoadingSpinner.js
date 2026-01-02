import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../constants/colors';

const LoadingSpinner = ({ label = 'Loading...' }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={colors.primary} />
    {label ? <Text style={styles.text}>{label}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  text: {
    marginTop: 8,
    fontSize: fonts.body,
    color: colors.gray,
  },
});

export default LoadingSpinner;
