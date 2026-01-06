import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import { Scissors, Clock, Users, MapPin, LogOut, CheckCircle, AlertCircle, Star, Search, Filter } from "lucide-react";
import { formatPhone, formatTime } from "../utils/format";

interface Barbershop {
  id: number;
  name: string;
  address: string;
  phone: string;
  cut_duration_minutes: number;
  is_favorite: number;
}

interface QueueInfo {
  queue: {
    id: number;
    barber_name: string;
    closing_time: string;
    max_capacity: number;
    is_open: boolean;
  } | null;
  barbershop: {
    id: number;
    name: string;
    address: string;
    phone: string;
    cut_duration_minutes: number;
    is_favorite: number;
  };
  queueSize: number;
  myPosition: number | null;
  myRequest: any;
}

export default function ClientDashboardPage() {
  const { user, isPending, logout } = useAuth();
  const navigate = useNavigate();
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [selectedBarbershop, setSelectedBarbershop] = useState<Barbershop | null>(null);
  const [queueInfo, setQueueInfo] = useState<QueueInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/");
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    loadBarbershops();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (selectedBarbershop) {
      loadQueueInfo();
      interval = setInterval(loadQueueInfo, 5000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [selectedBarbershop?.id]);

  const loadBarbershops = async () => {
    try {
      const response = await fetch("/api/barbershops");
      const data = await response.json();
      setBarbershops(data);
    } catch (error) {
      console.error("Error loading barbershops:", error);
    }
  };

  const loadQueueInfo = async () => {
    if (!selectedBarbershop) return;
    try {
      const response = await fetch(`/api/barbershops/${selectedBarbershop.id}/queue`);
      const data = await response.json();
      setQueueInfo(data);
      // Update selected barbershop with latest data
      if (data.barbershop) {
        setSelectedBarbershop(data.barbershop);
      }
    } catch (error) {
      console.error("Error loading queue info:", error);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent, barbershopId: number) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/barbershops/${barbershopId}/favorite`, {
        method: "POST",
      });
      const data = await response.json();
      
      // Update in local state
      setBarbershops(barbershops.map(b => 
        b.id === barbershopId ? { ...b, is_favorite: data.is_favorite ? 1 : 0 } : b
      ));
      
      if (selectedBarbershop?.id === barbershopId) {
        setSelectedBarbershop({ ...selectedBarbershop, is_favorite: data.is_favorite ? 1 : 0 });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const joinQueue = async () => {
    if (!selectedBarbershop) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/barbershops/${selectedBarbershop.id}/join-queue`, {
        method: "POST",
      });
      const data = await response.json();
      if (response.ok) {
        loadQueueInfo();
      } else {
        alert(data.error || "Erro ao entrar na fila");
      }
    } catch (error) {
      console.error("Error joining queue:", error);
    } finally {
      setLoading(false);
    }
  };

  const leaveQueue = async () => {
    if (!queueInfo?.queue || !confirm("Tem certeza que deseja sair da fila?")) return;
    setLoading(true);
    try {
      await fetch(`/api/queues/${queueInfo.queue.id}/leave`, {
        method: "POST",
      });
      loadQueueInfo();
    } catch (error) {
      console.error("Error leaving queue:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Filter barbershops based on search and filters
  const filteredBarbershops = barbershops.filter((barbershop) => {
    const matchesSearch = barbershop.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorites = !showFavoritesOnly || barbershop.is_favorite === 1;
    return matchesSearch && matchesFavorites;
  });

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="animate-pulse text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-400 rounded-xl flex items-center justify-center">
              <Scissors className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Filo</h1>
              <p className="text-sm text-blue-200">Painel do Cliente</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!selectedBarbershop ? (
          // Barbershop List
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6">Escolha uma Barbearia</h2>
            
            {/* Search and Filters */}
            <div className="mb-6 space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/60" />
                <input
                  type="text"
                  placeholder="Buscar barbearia..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-blue-300/60 focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-blue-200 text-sm">
                  <Filter className="w-4 h-4" />
                  <span>Filtros:</span>
                </div>
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    showFavoritesOnly
                      ? "bg-yellow-400/20 text-yellow-300 border border-yellow-400/30"
                      : "bg-white/10 text-blue-200 border border-white/20 hover:bg-white/15"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Star className={`w-4 h-4 ${showFavoritesOnly ? "fill-yellow-300" : ""}`} />
                    Favoritos
                  </div>
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {filteredBarbershops.map((barbershop) => (
                <div
                  key={barbershop.id}
                  className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 hover:border-blue-400 transition-all"
                >
                  <button
                    onClick={(e) => toggleFavorite(e, barbershop.id)}
                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors z-10"
                  >
                    <Star 
                      className={`w-5 h-5 ${barbershop.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-blue-300/50'}`} 
                    />
                  </button>
                  <button
                    onClick={() => setSelectedBarbershop(barbershop)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Scissors className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 pr-8">
                        <h3 className="text-xl font-bold text-white mb-2">{barbershop.name}</h3>
                        {barbershop.address && (
                          <p className="text-blue-200 text-sm flex items-center gap-2 mb-1">
                            <MapPin className="w-4 h-4" />
                            {barbershop.address}
                          </p>
                        )}
                        {barbershop.phone && (
                          <p className="text-blue-200 text-sm">{formatPhone(barbershop.phone)}</p>
                        )}
                        <p className="text-blue-300/60 text-xs mt-2">
                          ~{formatTime(barbershop.cut_duration_minutes)} por corte
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
            {barbershops.length === 0 && (
              <div className="text-center py-12">
                <p className="text-blue-200">Nenhuma barbearia disponível no momento</p>
              </div>
            )}
            {barbershops.length > 0 && filteredBarbershops.length === 0 && (
              <div className="text-center py-12">
                <p className="text-blue-200">Nenhuma barbearia encontrada com os filtros aplicados</p>
              </div>
            )}
          </div>
        ) : (
          // Queue View
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => {
                setSelectedBarbershop(null);
                setQueueInfo(null);
              }}
              className="mb-6 text-blue-200 hover:text-white transition-colors"
            >
              ← Voltar para lista de barbearias
            </button>

            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
              {/* Barbershop Header */}
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/20">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center">
                  <Scissors className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white">{selectedBarbershop.name}</h2>
                  {selectedBarbershop.address && (
                    <p className="text-blue-200 flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4" />
                      {selectedBarbershop.address}
                    </p>
                  )}
                  {selectedBarbershop.phone && (
                    <p className="text-blue-200 text-sm mt-1">{formatPhone(selectedBarbershop.phone)}</p>
                  )}
                </div>
                <button
                  onClick={(e) => toggleFavorite(e, selectedBarbershop.id)}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <Star 
                    className={`w-6 h-6 ${selectedBarbershop.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-blue-300/50'}`} 
                  />
                </button>
              </div>

              {!queueInfo?.queue ? (
                // No active queue
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-blue-300/50 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Fila Fechada</h3>
                  <p className="text-blue-200">Esta barbearia não está atendendo no momento</p>
                </div>
              ) : queueInfo.myPosition !== null ? (
                // User is in queue
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full mb-6">
                    <span className="text-6xl font-bold text-white">{queueInfo.myPosition}</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">Sua Posição</h3>
                  <p className="text-blue-200 text-lg mb-2">
                    {queueInfo.myPosition === 1
                      ? "Você é o próximo! Prepare-se."
                      : `${queueInfo.myPosition - 1} pessoa${
                          queueInfo.myPosition - 1 !== 1 ? "s" : ""
                        } na sua frente`}
                  </p>
                  <p className="text-blue-300/60 text-sm mb-8">
                    Tempo estimado: ~{formatTime((queueInfo.myPosition - 1) * queueInfo.barbershop.cut_duration_minutes)}
                  </p>

                  <div className="bg-white/5 rounded-2xl p-6 mb-6">
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <p className="text-blue-200 text-sm mb-1">Barbeiro</p>
                        <p className="text-white font-semibold">{queueInfo.queue.barber_name}</p>
                      </div>
                      <div>
                        <p className="text-blue-200 text-sm mb-1">Total na Fila</p>
                        <p className="text-white font-semibold">{queueInfo.queueSize} pessoas</p>
                      </div>
                      <div>
                        <p className="text-blue-200 text-sm mb-1">Tempo/Corte</p>
                        <p className="text-white font-semibold">{formatTime(queueInfo.barbershop.cut_duration_minutes)}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={leaveQueue}
                    disabled={loading}
                    className="px-8 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl font-semibold transition-colors disabled:opacity-50"
                  >
                    Sair da Fila
                  </button>
                </div>
              ) : queueInfo.myRequest ? (
                // User has pending request
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Solicitação Enviada</h3>
                  <p className="text-blue-200 mb-4">
                    A fila está cheia. Sua solicitação foi enviada ao barbeiro.
                  </p>
                  <p className="text-blue-200/70 text-sm">
                    Aguarde a aprovação do barbeiro para entrar na fila.
                  </p>
                </div>
              ) : (
                // Queue is open - can join
                <div className="text-center py-8">
                  <div className="bg-white/5 rounded-2xl p-8 mb-8">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <Users className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                        <p className="text-blue-200 text-sm mb-1">Pessoas na Fila</p>
                        <p className="text-3xl font-bold text-white">{queueInfo.queueSize}</p>
                        <p className="text-blue-300/60 text-xs mt-1">
                          ~{formatTime(queueInfo.queueSize * queueInfo.barbershop.cut_duration_minutes)} de espera
                        </p>
                      </div>
                      <div>
                        <Clock className="w-8 h-8 text-cyan-300 mx-auto mb-2" />
                        <p className="text-blue-200 text-sm mb-1">Fecha às</p>
                        <p className="text-3xl font-bold text-white">
                          {queueInfo.queue.closing_time}
                        </p>
                      </div>
                      <div>
                        <Scissors className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                        <p className="text-blue-200 text-sm mb-1">Barbeiro</p>
                        <p className="text-xl font-bold text-white">{queueInfo.queue.barber_name}</p>
                      </div>
                    </div>
                  </div>

                  {queueInfo.queueSize >= queueInfo.queue.max_capacity ? (
                    <div className="mb-6">
                      <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                      <p className="text-yellow-300 font-semibold mb-2">Fila Cheia</p>
                      <p className="text-blue-200 text-sm">
                        Você pode enviar uma solicitação e aguardar aprovação do barbeiro
                      </p>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                      <p className="text-green-300 font-semibold mb-2">Fila Disponível</p>
                      <p className="text-blue-200 text-sm">
                        Entre na fila agora e acompanhe sua posição
                      </p>
                    </div>
                  )}

                  <button
                    onClick={joinQueue}
                    disabled={loading}
                    className="px-12 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {queueInfo.queueSize >= queueInfo.queue.max_capacity
                      ? "Enviar Solicitação"
                      : "Entrar na Fila"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
