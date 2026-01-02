import React from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  ImageSourcePropType,
} from "react-native";
import { palette } from "../../theme/colors";

export interface LogoHeaderProps {
  logo?: ImageSourcePropType;
  subtitle?: string;
}

export function LogoHeader({
  logo,
  subtitle = "Sistema de Fila de Espera",
}: LogoHeaderProps) {
  return (
    <View style={styles.header}>
      {logo ? (
        <Image source={logo} style={styles.logo} resizeMode="contain" />
      ) : null}
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", marginBottom: 16 },
  logo: { height: 64, width: 160, marginBottom: 8 },
  subtitle: {
    color: `${palette.content.textOnDark}B3`,
    fontSize: 12,
    textAlign: "center",
    marginBottom: 16,
  },
});
