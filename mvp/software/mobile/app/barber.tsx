import { View, Text } from 'react-native';
import { Scissors } from 'lucide-react-native';
import { styled } from 'nativewind';

const Container = styled(View);
const Title = styled(Text);

export default function BarberDashboard() {
  return (
    <Container className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <View className="bg-white/10 backdrop-blur-lg border-b border-white/20 px-4 py-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl items-center justify-center">
              <Scissors color="#fff" size={24} />
            </View>
            <View>
              <Title className="text-xl font-bold text-white">Filo</Title>
              <Text className="text-sm text-blue-200">Painel do Barbeiro</Text>
            </View>
          </View>
        </View>
      </View>
      <View className="px-4 py-8">
        <View className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
          <Title className="text-white text-lg font-semibold mb-2">Fila atual</Title>
          <Text className="text-blue-200">Em breve: lista de clientes na fila</Text>
        </View>
      </View>
    </Container>
  );
}
