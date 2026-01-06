import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@getmocha/users-service/react";
import HomePage from "@/react-app/pages/Home";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";
import RoleSelectionPage from "@/react-app/pages/RoleSelection";
import BarberDashboardPage from "@/react-app/pages/BarberDashboard";
import ClientDashboardPage from "@/react-app/pages/ClientDashboard";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/role-selection" element={<RoleSelectionPage />} />
          <Route path="/barber" element={<BarberDashboardPage />} />
          <Route path="/client" element={<ClientDashboardPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
