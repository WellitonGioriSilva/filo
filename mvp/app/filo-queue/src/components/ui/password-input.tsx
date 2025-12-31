import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { palette } from "../../theme/colors";

export type PasswordInputProps = Omit<
  React.ComponentProps<typeof TextInput>,
  "style" | "secureTextEntry"
> & {
  style?: ViewStyle | ViewStyle[];
  inputStyle?: TextStyle | TextStyle[];
};

export const PasswordInput: React.FC<PasswordInputProps> = ({
  style,
  inputStyle,
  ...textInputProps
}) => {
  const [hidden, setHidden] = useState(true);

  return (
    <View style={[styles.container, style as ViewStyle]}>
      <TextInput
        {...textInputProps}
        style={[styles.input, inputStyle as TextStyle]}
        placeholderTextColor="#9CA3AF"
        autoCapitalize="none"
        secureTextEntry={hidden}
      />
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={hidden ? "Mostrar senha" : "Ocultar senha"}
        onPress={() => setHidden((v) => !v)}
        style={styles.iconBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {hidden ? (
          <Eye size={20} color={palette.outlineBorder} />
        ) : (
          <EyeOff size={20} color={palette.outlineBorder} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
  },
  iconBtn: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
