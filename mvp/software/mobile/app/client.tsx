import { View, Text } from 'react-native';
import { styled } from 'nativewind';

const Container = styled(View);
const Title = styled(Text);

export default function ClientDashboard() {
  return (
    <Container className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <View className="px-4 py-8">
        <View className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
          <Title className="text-white text-lg font-semibold mb-2">Minhas filas</Title>
          <Text className="text-blue-200">Em breve: status da sua posição</Text>
        </View>
      </View>
    </Container>
  );
}
