import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Button } from "../components/ui/button";
import { PasswordInput } from "../components/ui/password-input";
import { palette } from "../theme/colors";
import logo from "../assets/LogoWithe.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);

  const handleLogin = () => {
    if (!selectedRole || !email || !password) return;
    // Temporário: sem contexto/navegação, apenas feedback
    Alert.alert("Login", `Role: ${selectedRole}\nEmail: ${email}`);
  };

  const isClient = selectedRole === "client";
  const isBarber = selectedRole === "barber";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.subtitle}>Sistema de Fila de Espera</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Entrar</Text>

          <View style={styles.rolesRow}>
            <TouchableOpacity
              onPress={() => setSelectedRole("client")}
              style={[
                styles.role,
                isClient && styles.roleSelected,
                { borderColor: isClient ? palette.outlineBorder : "#E5E7EB" },
              ]}
            >
              <Text
                style={[styles.roleLabel, isClient && styles.roleLabelSelected]}
              >
                Cliente
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedRole("barber")}
              style={[
                styles.role,
                isBarber && styles.roleSelected,
                { borderColor: isBarber ? palette.outlineBorder : "#E5E7EB" },
              ]}
            >
              <Text
                style={[styles.roleLabel, isBarber && styles.roleLabelSelected]}
              >
                Barbeiro
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              keyboardType="email-address"
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Senha</Text>
            <PasswordInput
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <Button
            onPress={handleLogin}
            disabled={!selectedRole || !email || !password}
            style={{ width: "100%", marginTop: 24 }}
            size="lg"
          >
            Entrar
          </Button>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Não tem conta?</Text>
            <TouchableOpacity
              onPress={() => Alert.alert("Cadastro", "Em breve")}
            >
              <Text style={styles.signupLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.dark },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  header: { alignItems: "center", marginBottom: 16 },
  logo: { height: 64, width: 160, marginBottom: 8 },
  subtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 16,
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    // shadow (basic cross-platform)
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 16,
  },
  rolesRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  role: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: "#FFFFFF",
  },
  roleSelected: { backgroundColor: "#EFF6FF" },
  roleLabel: { fontWeight: "600", color: "#111827" },
  roleLabelSelected: { color: palette.outlineBorder },
  field: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: "600", color: "#111827", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  signupText: { color: "#6B7280", fontSize: 12, marginRight: 6 },
  signupLink: {
    color: palette.outlineBorder,
    fontWeight: "700",
    fontSize: 12,
    textDecorationLine: "underline",
  },
});
