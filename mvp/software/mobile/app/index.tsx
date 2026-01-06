import { View, Text, Pressable, TextInput } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { auth, signInWithGoogle, signInWithEmail } from '../src/firebase';
import { useRouter } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

export default function Home() {
  const router = useRouter();

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    webClientId: 'YOUR_WEB_CLIENT_ID',
    responseType: 'id_token',
  });

  useEffect(() => {
    const run = async () => {
      if (response?.type === 'success') {
        const { idToken, accessToken } = (response as any).authentication || {};
        if (idToken) {
          await signInWithGoogle(idToken, accessToken);
          router.push('/role-selection');
        }
      }
    };
    run();
  }, [response]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleEmailLogin() {
    if (!email || !password) return;
    await signInWithEmail(email, password).catch(() => {});
    router.push('/role-selection');
  }

  return (
    <View className="min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-6">
      <View className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 border border-white/20 w-full max-w-md">
        <Text className="text-white text-2xl font-bold text-center mb-6">Filo</Text>
        <Text className="text-blue-200 text-center mb-6">Sistema de Fila para Barbearias</Text>
        <Pressable
          className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl mb-3"
          disabled={!request}
          onPress={() => promptAsync()}
        >
          <Text className="text-white text-center">Entrar com Google</Text>
        </Button>
        <View className="mb-3">
          <TextInput
            placeholder="Email"
            placeholderTextColor="#cbd5e1"
            className="px-4 py-3 bg-white/10 text-white rounded-xl mb-2"
            onChangeText={setEmail}
            value={email}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            placeholder="Senha"
            placeholderTextColor="#cbd5e1"
            className="px-4 py-3 bg-white/10 text-white rounded-xl"
            onChangeText={setPassword}
            value={password}
            secureTextEntry
          />
        </View>
        <Pressable
          className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl"
          onPress={handleEmailLogin}
        >
          <Text className="text-white text-center">Entrar com Email</Text>
        </Pressable>
      </View>
    </View>
  );
}
