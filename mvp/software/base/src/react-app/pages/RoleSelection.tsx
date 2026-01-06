import { useState } from "react";
import { useNavigate } from "react-router";
import { Scissors, User } from "lucide-react";

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const [showBarberForm, setShowBarberForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);

  const [barberData, setBarberData] = useState({
    barbershopName: "",
    address: "",
    phone: "",
    barberName: "",
    cutDuration: 30,
    barbershopCode: "",
  });
  const [joinExisting, setJoinExisting] = useState(false);

  const [clientData, setClientData] = useState({
    name: "",
    phone: "",
  });

  const handleBarberSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/profile/setup-barber", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(barberData),
      });

      if (response.ok) {
        navigate("/barber");
      }
    } catch (error) {
      console.error("Error setting up barber:", error);
    }
  };

  const handleClientSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/profile/setup-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientData),
      });

      if (response.ok) {
        navigate("/client");
      }
    } catch (error) {
      console.error("Error setting up client:", error);
    }
  };

  if (showBarberForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-16 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">
              {joinExisting ? "Entrar em Barbearia" : "Configure sua Barbearia"}
            </h2>
            <p className="text-blue-200 text-center mb-6">
              {joinExisting ? "Use o código fornecido pela sua barbearia" : "Crie uma nova barbearia"}
            </p>

            {!joinExisting && (
              <button
                type="button"
                onClick={() => setJoinExisting(true)}
                className="w-full mb-6 py-3 bg-white/5 hover:bg-white/10 text-blue-300 rounded-xl transition-colors text-sm"
              >
                Já tenho um código de barbearia
              </button>
            )}

            {joinExisting && (
              <button
                type="button"
                onClick={() => setJoinExisting(false)}
                className="w-full mb-6 py-3 bg-white/5 hover:bg-white/10 text-blue-300 rounded-xl transition-colors text-sm"
              >
                Criar nova barbearia
              </button>
            )}

            <form onSubmit={handleBarberSetup} className="space-y-6">
              {joinExisting ? (
                <>
                  <div>
                    <label className="block text-blue-200 mb-2 font-medium">Código da Barbearia</label>
                    <input
                      type="text"
                      required
                      value={barberData.barbershopCode}
                      onChange={(e) =>
                        setBarberData({ ...barberData, barbershopCode: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="abc123xyz"
                    />
                  </div>
                  <div>
                    <label className="block text-blue-200 mb-2 font-medium">Seu Nome</label>
                    <input
                      type="text"
                      required
                      value={barberData.barberName}
                      onChange={(e) => setBarberData({ ...barberData, barberName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="João Silva"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-blue-200 mb-2 font-medium">Nome da Barbearia</label>
                    <input
                      type="text"
                      required
                      value={barberData.barbershopName}
                      onChange={(e) =>
                        setBarberData({ ...barberData, barbershopName: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Barbearia Premium"
                    />
                  </div>
                  <div>
                    <label className="block text-blue-200 mb-2 font-medium">Seu Nome</label>
                    <input
                      type="text"
                      required
                      value={barberData.barberName}
                      onChange={(e) => setBarberData({ ...barberData, barberName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="João Silva"
                    />
                  </div>
                  <div>
                    <label className="block text-blue-200 mb-2 font-medium">Tempo Médio por Corte</label>
                    <input
                      type="number"
                      min="10"
                      max="120"
                      required
                      value={barberData.cutDuration}
                      onChange={(e) => setBarberData({ ...barberData, cutDuration: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="30"
                    />
                    <p className="text-blue-300/60 text-xs mt-1">Tempo estimado em minutos</p>
                  </div>
                  <div>
                    <label className="block text-blue-200 mb-2 font-medium">Endereço (opcional)</label>
                    <input
                      type="text"
                      value={barberData.address}
                      onChange={(e) => setBarberData({ ...barberData, address: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Rua Principal, 123"
                    />
                  </div>
                  <div>
                    <label className="block text-blue-200 mb-2 font-medium">Telefone (opcional)</label>
                    <input
                      type="tel"
                      value={barberData.phone}
                      onChange={(e) => setBarberData({ ...barberData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </>
              )}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowBarberForm(false)}
                  className="flex-1 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Continuar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (showClientForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-16 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Complete seu Perfil</h2>
            <form onSubmit={handleClientSetup} className="space-y-6">
              <div>
                <label className="block text-blue-200 mb-2 font-medium">Seu Nome</label>
                <input
                  type="text"
                  required
                  value={clientData.name}
                  onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Maria Santos"
                />
              </div>
              <div>
                <label className="block text-blue-200 mb-2 font-medium">Telefone (opcional)</label>
                <input
                  type="tel"
                  value={clientData.phone}
                  onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowClientForm(false)}
                  className="flex-1 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Continuar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Como você deseja usar o Filo?</h1>
          <p className="text-blue-200 text-lg">Selecione uma opção para continuar</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <button
            onClick={() => setShowBarberForm(true)}
            className="group bg-white/10 backdrop-blur-lg rounded-3xl p-10 border-2 border-white/20 hover:border-blue-400 hover:bg-white/15 transition-all"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Scissors className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Sou Barbeiro</h3>
            <p className="text-blue-200">
              Gerencie sua barbearia, controle a fila de espera e atenda seus clientes com
              eficiência
            </p>
          </button>

          <button
            onClick={() => setShowClientForm(true)}
            className="group bg-white/10 backdrop-blur-lg rounded-3xl p-10 border-2 border-white/20 hover:border-cyan-400 hover:bg-white/15 transition-all"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <User className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Sou Cliente</h3>
            <p className="text-blue-200">
              Entre na fila de barbearias remotamente e acompanhe sua posição em tempo real
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
