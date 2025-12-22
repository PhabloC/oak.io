import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { TransactionsProvider } from "./context/TransactionsContext";
import Transactions from "./pages/Transactions";

export default function App() {
  // Remove o estado isProcessingAuth e o useEffect que processa OAuth
  // Deixa o Login.jsx e ProtectedRoute.jsx lidarem com isso

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
