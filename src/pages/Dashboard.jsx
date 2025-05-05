import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebaseConfig";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/");
    }
  }, [navigate]);

  // Verifica se a rota atual é "/dashboard" ou "/transacoes"
  const showSidebar =
    location.pathname === "/dashboard" || location.pathname === "/transacoes";

  return (
    <div className="text-white flex">
      {showSidebar && <Sidebar />}{" "}
      {/* Renderiza o Sidebar apenas nas rotas especificadas */}
      <div className="flex-1">
        <Header />
        <div className="p-4 ml-28 mt-8">
          <h1>Bem-vindo ao Dashboard!</h1>
        </div>
      </div>
    </div>
  );
}
