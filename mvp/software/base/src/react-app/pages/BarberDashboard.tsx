import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import {
  Scissors,
  Clock,
  Users,
  UserPlus,
  LogOut,
  PlayCircle,
  StopCircle,
  Bell,
  Copy,
  Check,
} from "lucide-react";
import { formatTime } from "../utils/format";

interface Queue {
  id: number;
  is_open: boolean;
  closing_time: string;
  max_capacity: number;
  barber_name: string;
  barbershop_name: string;
  unique_code: string;
  cut_duration_minutes: number;
}

interface QueueEntry {
  id: number;
  position: number;
  client_name: string;
  created_at: string;
  called_at?: string;
}

interface QueueRequest {
  id: number;
  client_name: string;
  created_at: string;
}

export default function BarberDashboardPage() {
  const { user, isPending, logout } = useAuth();
  const navigate = useNavigate();
  const [queue, setQueue] = useState<Queue | null>(null);
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<QueueEntry | null>(null);
  const [requests, setRequests] = useState<QueueRequest[]>([]);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [closingTime, setClosingTime] = useState("18:00");
  const [maxCapacity, setMaxCapacity] = useState(10);
  const [newClient, setNewClient] = useState({ name: "", phone: "" });
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/");
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    if (user) {
      loadQueue();
      const interval = setInterval(loadQueue, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadQueue = async () => {
    try {
      const response = await fetch("/api/queues/my-queue");
      const data = await response.json();
      if (data.queue) {
        setQueue(data.queue);
        setEntries(data.entries || []);
        setCurrentEntry(data.currentEntry || null);
        setRequests(data.requests || []);
      } else {
        setQueue(null);
        setEntries([]);
        setCurrentEntry(null);
        setRequests([]);
      }
    } catch (error) {
      console.error("Error loading queue:", error);
    }
  };

  const copyCode = () => {
    if (queue?.unique_code) {
      navigator.clipboard.writeText(queue.unique_code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const openQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/queues/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ closingTime, maxCapacity }),
      });
      setShowOpenModal(false);
      loadQueue();
    } catch (error) {
      console.error("Error opening queue:", error);
    }
  };

  const closeQueue = async () => {
    if (!queue || !confirm("Tem certeza que deseja fechar a fila?")) return;
    try {
      await fetch(`/api/queues/${queue.id}/close`, { method: "POST" });
      loadQueue();
    } catch (error) {
      console.error("Error closing queue:", error);
    }
  };

  const addAnonymousClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queue) return;
    try {
      await fetch(`/api/queues/${queue.id}/add-anonymous`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient),
      });
      setShowAddClientModal(false);
      setNewClient({ name: "", phone: "" });
      loadQueue();
    } catch (error) {
      console.error("Error adding client:", error);
    }
  };

  const callNext = async () => {
    if (!queue) return;
    try {
      await fetch(`/api/queues/${queue.id}/call-next`, { method: "POST" });
      loadQueue();
    } catch (error) {
      console.error("Error calling next:", error);
    }
  };

  const completeCurrent = async () => {
    if (!queue) return;
    try {
      await fetch(`/api/queues/${queue.id}/complete-current`, { method: "POST" });
      loadQueue();
    } catch (error) {
      console.error("Error completing current:", error);
    }
  };

  const approveRequest = async (requestId: number) => {
    try {
      await fetch(`/api/queues/requests/${requestId}/approve`, { method: "POST" });
      loadQueue();
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const rejectRequest = async (requestId: number) => {
    try {
      await fetch(`/api/queues/requests/${requestId}/reject`, { method: "POST" });
      loadQueue();
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

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
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
              <Scissors className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Filo</h1>
              <p className="text-sm text-blue-200">Painel do Barbeiro</p>
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
        {!queue ? (
          // No active queue
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 text-center">
              <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-blue-300" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Nenhuma Fila Ativa</h2>
              <p className="text-blue-200 mb-8">
                Abra seu expediente para começar a atender clientes
              </p>
              <button
                onClick={() => setShowOpenModal(true)}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                <PlayCircle className="w-5 h-5 inline mr-2" />
                Abrir Expediente
              </button>
            </div>
          </div>
        ) : (
          // Active queue
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Queue Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">Código da Barbearia</h3>
                <div className="bg-white/5 rounded-xl p-4 mb-4">
                  <p className="text-blue-200 text-sm mb-2">Compartilhe com outros barbeiros:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-4 py-3 bg-slate-900/50 rounded-lg text-cyan-300 font-mono text-lg">
                      {queue.unique_code}
                    </code>
                    <button
                      onClick={copyCode}
                      className="p-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors"
                      title="Copiar código"
                    >
                      {codeCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">Status da Fila</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200">Status</span>
                    <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-lg text-sm font-semibold">
                      Aberta
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200">Na Fila</span>
                    <span className="text-2xl font-bold text-white">{entries.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200">Capacidade</span>
                    <span className="text-white">
                      {entries.length}/{queue.max_capacity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200">Tempo/Corte</span>
                    <span className="text-white">{formatTime(queue.cut_duration_minutes)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200">Fecha às</span>
                    <span className="text-white">{queue.closing_time}</span>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => setShowAddClientModal(true)}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-5 h-5" />
                    Adicionar Cliente
                  </button>
                  <button
                    onClick={closeQueue}
                    className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <StopCircle className="w-5 h-5" />
                    Fechar Expediente
                  </button>
                </div>
              </div>

              {/* Requests */}
              {requests.length > 0 && (
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Bell className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-xl font-bold text-white">Solicitações</h3>
                  </div>
                  <div className="space-y-3">
                    {requests.map((request) => (
                      <div
                        key={request.id}
                        className="bg-white/5 rounded-xl p-4 border border-yellow-400/30"
                      >
                        <p className="text-white font-semibold mb-2">{request.client_name}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveRequest(request.id)}
                            className="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg text-sm font-semibold transition-colors"
                          >
                            Aprovar
                          </button>
                          <button
                            onClick={() => rejectRequest(request.id)}
                            className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm font-semibold transition-colors"
                          >
                            Rejeitar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Queue List */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6">Fila de Espera</h3>

                {currentEntry && (
                  <div className="mb-6 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border-2 border-blue-400/50 rounded-xl p-6">
                    <p className="text-blue-200 text-sm mb-2">Atendendo agora:</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-bold text-2xl">{currentEntry.client_name}</p>
                        {currentEntry.called_at && (
                          <p className="text-blue-300 text-sm">
                            Chamado às {new Date(currentEntry.called_at).toLocaleTimeString("pt-BR")}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={completeCurrent}
                        className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
                      >
                        Concluir
                      </button>
                    </div>
                  </div>
                )}

                {entries.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-blue-300/50 mx-auto mb-4" />
                    <p className="text-blue-200">Nenhum cliente na fila</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {entries.map((entry, index) => {
                      const estimatedWait = (index + (currentEntry ? 1 : 0)) * queue.cut_duration_minutes;
                      return (
                        <div
                          key={entry.id}
                          className={`${
                            index === 0 && !currentEntry
                              ? "bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border-blue-400/50"
                              : "bg-white/5 border-white/10"
                          } border rounded-xl p-4 flex items-center justify-between`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`${
                                index === 0 && !currentEntry ? "bg-blue-500" : "bg-white/20"
                              } w-12 h-12 rounded-xl flex items-center justify-center`}
                            >
                              <span className="text-white font-bold text-lg">
                                {entry.position}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-semibold text-lg">{entry.client_name}</p>
                              <p className="text-blue-200 text-sm">
                                Espera: ~{formatTime(estimatedWait)} • Entrou às {new Date(entry.created_at).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          {index === 0 && !currentEntry && (
                            <button
                              onClick={callNext}
                              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
                            >
                              Chamar
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Open Queue Modal */}
      {showOpenModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-3xl p-8 max-w-md w-full border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6">Abrir Expediente</h3>
            <form onSubmit={openQueue} className="space-y-4">
              <div>
                <label className="block text-blue-200 mb-2">Horário de Fechamento</label>
                <input
                  type="time"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-blue-200 mb-2">Capacidade Máxima</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowOpenModal(false)}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Abrir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddClientModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-3xl p-8 max-w-md w-full border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6">Adicionar Cliente</h3>
            <form onSubmit={addAnonymousClient} className="space-y-4">
              <div>
                <label className="block text-blue-200 mb-2">Nome do Cliente</label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="João Silva"
                  required
                />
              </div>
              <div>
                <label className="block text-blue-200 mb-2">Telefone (opcional)</label>
                <input
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddClientModal(false);
                    setNewClient({ name: "", phone: "" });
                  }}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
