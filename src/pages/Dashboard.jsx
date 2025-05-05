import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebaseConfig";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import Grafico from "../components/Grafico/Grafico";
import Cards from "../components/Cards/Cards";

import Quadro from "../components/Quadro/Quadro";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMonth, setSelectedMonth] = useState("Janeiro 2023");

  const months = [
    "Janeiro 2025",
    "Fevereiro 2025",
    "Março 2025",
    "Abril 2025",
    "Maio 2025",
    "Junho 2025",
    "Julho 2025",
    "Agosto 2025",
    "Setembro 2025",
    "Outubro 2025",
    "Novembro 2025",
    "Dezembro 2025",
  ];

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/");
    }
  }, [navigate]);

  // Verifica se a rota atual é "/dashboard" ou "/transacoes"
  const showSidebar =
    location.pathname === "/dashboard" || location.pathname === "/transacoes";

  // Dados para os gráficos
  const lineData = {
    labels: ["Janeiro", "Fevereiro", "Março"],
    datasets: [
      {
        label: "Ganhos",
        data: [5000, 7000, 8000],
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        tension: 0.4,
      },
      {
        label: "Gastos",
        data: [2000, 3000, 2500],
        borderColor: "#F44336",
        backgroundColor: "rgba(244, 67, 54, 0.2)",
        tension: 0.4,
      },
      {
        label: "Investimentos",
        data: [1500, 2000, 1800],
        borderColor: "#2196F3",
        backgroundColor: "rgba(33, 150, 243, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const pieData = {
    labels: ["Ganhos", "Gastos", "Investimentos"],
    datasets: [
      {
        data: [5000, 2000, 1500],
        backgroundColor: ["#4CAF50", "#F44336", "#2196F3"],
      },
    ],
  };

  return (
    <div className="text-white flex overflow-hidden h-screen">
      {showSidebar && <Sidebar />}
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="p-4 ml-28 mt-4 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            {/* Título */}
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
            {/* Dropdown de Mês */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-gray-800 text-white p-2 rounded-lg"
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-1">
            {/* Coluna com Cards e Gráficos */}
            <div className="flex flex-col gap-8 flex-1">
              {/* Cards */}
              <Cards />

              {/* Gráficos */}
              <Grafico lineData={lineData} pieData={pieData} />
            </div>

            {/* Quadro de Transações */}
            <Quadro />
          </div>
        </div>
      </div>
    </div>
  );
}
