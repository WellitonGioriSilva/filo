import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@getmocha/users-service/react";

export default function AuthCallbackPage() {
  const { exchangeCodeForSessionToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    exchangeCodeForSessionToken()
      .then(() => {
        // Check profile after login
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
      })
      .catch((error) => {
        console.error("Auth error:", error);
        navigate("/");
      });
  }, [exchangeCodeForSessionToken, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="text-center">
        <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-white text-xl">Autenticando...</p>
      </div>
    </div>
  );
}
