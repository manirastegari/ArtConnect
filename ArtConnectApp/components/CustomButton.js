import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const CustomButton = ({ onPress, text, color, width, disabled, height, style }) => {
  return (
    <TouchableOpacity
      onPress={disabled ? null : onPress} // Disable onPress if the button is disabled
      style={[
        styles.button,
        { backgroundColor: disabled ? '#ccc' : color, width: width, height: height }, // Change color if disabled
        disabled && styles.disabledButton, // Apply additional styles if disabled
        style,
      ]}
      activeOpacity={disabled ? 1 : 0.7} // Prevent opacity change if disabled
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
    opacity: 0.6, // Reduce opacity for a disabled look
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CustomButton;