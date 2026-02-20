import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { TransactionsProvider } from "./context/TransactionsContext";
import { YearProvider } from "./context/YearContext";
import Transactions from "./pages/Transactions";
import Metas from "./pages/Metas";
import Dividas from "./pages/Dividas";
import Investimento from "./pages/Investimento";

export default function App() {
  return (
    <ErrorBoundary>
      <YearProvider>
        <TransactionsProvider>
          <Router>
          <div className="flex min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-950">
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
                <Route
                  path="/metas"
                  element={
                    <ProtectedRoute>
                      <Metas />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dividas"
                  element={
                    <ProtectedRoute>
                      <Dividas />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/investimento"
                  element={
                    <ProtectedRoute>
                      <Investimento />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </div>
          </Router>
        </TransactionsProvider>
      </YearProvider>
    </ErrorBoundary>
  );
}
