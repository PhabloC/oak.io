import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { TransactionsProvider } from "./context/TransactionsContext";
import Transactions from "./pages/Transactions";
import { supabase } from "./supabaseClient";

export default function App() {
  // Processa o callback OAuth do Supabase quando a página carrega
  useEffect(() => {
    const handleAuthCallback = async () => {
      // Verifica se há um código de autorização na URL (callback OAuth)
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      // Verifica hash fragments também (alguns casos)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");

      if (code || accessToken) {
        // O Supabase processa automaticamente, mas limpamos a URL
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, "", cleanUrl);
      }

      // Verifica se já existe uma sessão
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        console.log("Sessão encontrada:", session.user.email);
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <TransactionsProvider>
      <Router>
        <div className="flex h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-950">
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transacoes"
                element={
                  <ProtectedRoute>
                    <Transactions />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </div>
      </Router>
    </TransactionsProvider>
  );
}
