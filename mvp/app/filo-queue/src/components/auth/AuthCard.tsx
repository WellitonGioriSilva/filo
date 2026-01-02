import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { palette } from "../../theme/colors";

export interface AuthCardProps {
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
}

export function AuthCard({ style, children }: AuthCardProps) {
  return <View style={[styles.card, style as ViewStyle]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: palette.surfaces.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: palette.ui.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
});
