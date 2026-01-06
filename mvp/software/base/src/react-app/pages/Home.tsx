import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import { Scissors, Clock, Users } from "lucide-react";

export default function HomePage() {
  const { user, isPending, redirectToLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPending && user) {
      // Check user profile and redirect accordingly
      fetch("/api/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.role === "barber") {
            navigate("/barber");
          } else if (data.role === "client") {
            navigate("/client");
          } else {
            navigate("/role-selection");
          }
        });
    }
  }, [user, isPending, navigate]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="animate-pulse text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-3xl shadow-2xl shadow-blue-500/50 mb-8">
              <Scissors className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-6xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-cyan-200">
              Filo
            </h1>
            <p className="text-2xl text-blue-100 mb-4">
              Sistema de Fila de Espera para Barbearias
            </p>
            <p className="text-lg text-blue-200/80 max-w-2xl mx-auto">
              Gerencie sua barbearia com eficiência e ofereça uma experiência moderna para seus clientes
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-blue-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Tempo Real</h3>
              <p className="text-blue-200/80">
                Acompanhe a fila em tempo real e saiba exatamente quando será sua vez
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-14 h-14 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-cyan-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Gestão Simples</h3>
              <p className="text-blue-200/80">
                Interface intuitiva para barbeiros gerenciarem a fila com facilidade
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                <Scissors className="w-8 h-8 text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Sem Espera Física</h3>
              <p className="text-blue-200/80">
                Clientes podem entrar na fila remotamente e chegar no momento certo
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={redirectToLogin}
              className="px-12 py-5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xl font-semibold rounded-2xl shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 hover:scale-105 transition-all duration-300"
            >
              Entrar com Google
            </button>
            <p className="text-blue-200/60 mt-6 text-sm">
              Conecte-se de forma segura para começar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
