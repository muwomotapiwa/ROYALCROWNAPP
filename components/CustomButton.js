import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts } from '../constants/colors';

const CustomButton = ({ title, onPress, style, textStyle, variant = 'primary', disabled }) => {
  const backgroundColor = variant === 'ghost' ? 'transparent' : variant === 'secondary' ? colors.primary : colors.gold;
  const textColor = variant === 'ghost' ? colors.primary : variant === 'secondary' ? colors.white : colors.navy;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: disabled ? colors.gray : pressed ? colors.goldDark : backgroundColor },
        style,
      ]}
    >
      <Text style={[styles.text, { color: textColor }, textStyle]}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: fonts.body,
    fontWeight: '600',
  },
});

export default CustomButton;
