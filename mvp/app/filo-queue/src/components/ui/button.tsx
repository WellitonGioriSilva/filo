import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { palette } from "../../theme/colors";

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
}

export function PrimaryButton({
  title,
  onPress,
  disabled,
  style,
  textStyle,
}: ButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={!!disabled}
      style={[
        styles.button,
        disabled ? styles.buttonDisabled : null,
        style as ViewStyle,
      ]}
    >
      <Text style={[styles.text, textStyle as TextStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: palette.brand.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  text: {
    color: palette.content.textPrimary,
    fontWeight: "700",
    fontSize: 16,
  },
});

export default PrimaryButton;
