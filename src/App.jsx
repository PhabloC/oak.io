import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Transitions from "./pages/Transitions";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar/Sidebar";

export default function App() {
  return (
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
                  <Transitions />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
