import { View, Text, Pressable } from 'react-native';
import { styled } from 'nativewind';
import { useRouter } from 'expo-router';

const Container = styled(View);
const Button = styled(Pressable);
const Title = styled(Text);

export default function RoleSelection() {
  const router = useRouter();
  return (
    <Container className="min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-6">
      <View className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 w-full max-w-md">
        <Title className="text-white text-xl font-bold text-center mb-6">Selecione seu papel</Title>
        <Button className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl mb-3" onPress={() => router.push('/barber')}>
          <Text className="text-white text-center">Barbeiro</Text>
        </Button>
        <Button className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl" onPress={() => router.push('/client')}>
          <Text className="text-white text-center">Cliente</Text>
        </Button>
      </View>
    </Container>
  );
}
