import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const CustomButton = ({ onPress, text, color, width, disabled, height, style }) => {
  return (
    <TouchableOpacity
      onPress={disabled ? null : onPress} 
      style={[
        styles.button,
        { backgroundColor: disabled ? '#ccc' : color, width: width, height: height }, 
        disabled && styles.disabledButton, 
        style,
      ]}
      activeOpacity={disabled ? 1 : 0.7} 
    >
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CustomButton;