import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

import ProtectedRoute from "./components/ProtectedRoute";
import { TransactionsProvider } from "./context/TransactionsContext"; // Importe o TransactionsProvider
import Transactions from "./pages/Transactions";

export default function App() {
  return (
    <TransactionsProvider>
      <Router>
        <div className="flex h-screen bg-[#1E1E2F]">
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
