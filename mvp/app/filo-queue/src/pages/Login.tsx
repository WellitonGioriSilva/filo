import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
} from "react-native";
import { palette } from "../theme/colors";
import { LogoHeader } from "../components/auth/LogoHeader";
import { AuthCard } from "../components/auth/AuthCard";
import { TextField } from "../components/ui/text-field";
import PasswordField from "../components/ui/password-field";
import PrimaryButton from "../components/ui/button";
import { login as loginApi } from "../services/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isValid = email.trim().length > 0 && password.trim().length > 0;

  async function handleLogin() {
    try {
      setLoading(true);
      setError(null);
      const { token, user } = await loginApi(email.trim(), password.trim());
      // TODO: persist token (AsyncStorage/SecureStore) and navigate
      console.log("Login ok", { token, user });
      Alert.alert("Login bem-sucedido");
    } catch (e: any) {
      setError(e?.message ?? "Falha no login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
      >
        <View style={styles.content}>
          <LogoHeader
            logo={require("../assets/LogoWithe.png")}
            subtitle="Sistema de Fila de Espera"
          />

          <AuthCard>
            <Text style={styles.title}>Entrar</Text>

            <TextField
              label="E-mail"
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <PasswordField
              label="Senha"
              value={password}
              onChangeText={setPassword}
            />

            <PrimaryButton
              title="Entrar"
              disabled={!isValid || loading}
              onPress={handleLogin}
            />

            {error ? (
              <Text
                style={{ color: "#e53935", textAlign: "center", marginTop: 12 }}
              >
                {error}
              </Text>
            ) : null}

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Não tem conta? </Text>
              <Text style={styles.signupLink}>Cadastre-se</Text>
            </View>
          </AuthCard>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.surfaces.appBackground,
  },
  screen: {
    flex: 1,
    backgroundColor: palette.surfaces.appBackground,
    paddingHorizontal: 16,
    paddingVertical: 32,
    justifyContent: "center",
  },
  content: {
    maxWidth: 360,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.content.textPrimary,
    marginBottom: 12,
    textAlign: "center",
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  signupText: {
    color: palette.content.textMuted,
  },
  signupLink: {
    color: palette.brand.primaryDark,
    fontWeight: "700",
  },
});
