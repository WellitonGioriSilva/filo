import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable } from "react-native";
import { palette } from "../../theme/colors";

export interface PasswordFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
}

export function PasswordField({
  label = "Senha",
  placeholder = "••••••••",
  value,
  onChangeText,
}: PasswordFieldProps) {
  const [secure, setSecure] = useState(true);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure}
          placeholder={placeholder}
          placeholderTextColor={palette.ui.inputPlaceholder}
          style={styles.input}
        />
        <Pressable style={styles.toggle} onPress={() => setSecure(!secure)}>
          <Text style={styles.toggleText}>{secure ? "Ver" : "Ocultar"}</Text>
        </Pressable>
      </View>
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
  inputWrapper: {
    position: "relative",
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
    paddingRight: 72,
  },
  toggle: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleText: {
    color: palette.content.textMuted,
    fontWeight: "600",
  },
});

export default PasswordField;
