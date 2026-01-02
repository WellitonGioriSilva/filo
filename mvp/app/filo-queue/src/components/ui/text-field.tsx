import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from "react-native";
import { palette } from "../../theme/colors";

export interface TextFieldProps extends Omit<TextInputProps, "style"> {
  label: string;
  containerStyle?: ViewStyle | ViewStyle[];
  inputStyle?: TextStyle | TextStyle[];
}

export function TextField({
  label,
  containerStyle,
  inputStyle,
  ...props
}: TextFieldProps) {
  return (
    <View style={[styles.field, containerStyle as ViewStyle]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        style={[styles.input, inputStyle as TextStyle]}
        placeholderTextColor={palette.ui.inputPlaceholder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 12 },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: palette.content.label,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.ui.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: palette.content.textPrimary,
    backgroundColor: palette.ui.inputBg,
  },
});
