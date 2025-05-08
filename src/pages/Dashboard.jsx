import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import Grafico from "../components/Grafico/Grafico";
import Cards from "../components/Cards/Cards";
import Quadro from "../components/Quadro/Quadro";
import { BsDatabaseFillAdd } from "react-icons/bs";
import ModalTransacao from "../components/Modal/ModalTransacao";
import { useTransactions } from "../context/TransactionsContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { transactions, setTransactions } = useTransactions();
  const [selectedMonth, setSelectedMonth] = useState("Janeiro 2025");
  const [showPopup, setShowPopup] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    saldo: 0,
    gastos: 0,
    investimentos: 0,
  });

  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/");
    }
  }, [navigate]);

  const showSidebar =
    location.pathname === "/dashboard" || location.pathname === "/transacoes";

  // Função para carregar transações do Firestore
  const loadTransactions = async (month) => {
    try {
      const userId = auth.currentUser.uid;
      const transactionsRef = collection(db, "users", userId, "transactions");
      const q = query(transactionsRef, where("month", "==", month));
      const querySnapshot = await getDocs(q);

      const loadedTransactions = [];
      querySnapshot.forEach((doc) => {
        loadedTransactions.push({ id: doc.id, ...doc.data() });
      });

      setTransactions(loadedTransactions);
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
    }
  };

  // Função para calcular os dados do Dashboard
  const calculateDashboardData = (transactions) => {
    const saldo = transactions.reduce((acc, t) => acc + t.value, 0);
    const gastos = transactions
      .filter((t) => t.type === "Gasto")
      .reduce((acc, t) => acc + Math.abs(t.value), 0);
    const investimentos = transactions
      .filter((t) => t.type === "Investimento")
      .reduce((acc, t) => acc + Math.abs(t.value), 0);

    return { saldo, gastos, investimentos };
  };

  // Atualiza os dados do Dashboard sempre que as transações ou o mês mudarem
  useEffect(() => {
    loadTransactions(selectedMonth);
  }, [selectedMonth]);

  useEffect(() => {
    const data = calculateDashboardData(transactions);
    setDashboardData(data);
  }, [transactions]);

  const handleAddTransaction = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const lineData = {
    labels: ["Janeiro", "Fevereiro", "Março"],
    datasets: [
      {
        label: "Ganhos",
        data: transactions
          .filter((t) => t.type === "Ganho")
          .map((t) => t.value),
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        tension: 0.4,
      },
      {
        label: "Gastos",
        data: transactions
          .filter((t) => t.type === "Gasto")
          .map((t) => t.value),
        borderColor: "#F44336",
        backgroundColor: "rgba(244, 67, 54, 0.2)",
        tension: 0.4,
      },
      {
        label: "Investimentos",
        data: transactions
          .filter((t) => t.type === "Investimento")
          .map((t) => t.value),
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
        data: [
          dashboardData.saldo,
          dashboardData.gastos,
          dashboardData.investimentos,
        ],
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
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={handleAddTransaction}
                className="bg-gray-800 text-white p-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition duration-300"
              >
                <BsDatabaseFillAdd className="text-lg" />
                <span>Adicionar transação</span>
              </button>
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
          </div>

          <div className="flex flex-1">
            <div className="flex flex-col gap-8 flex-1">
              <Cards
                saldo={dashboardData.saldo}
                gastos={dashboardData.gastos}
                investimentos={dashboardData.investimentos}
              />
              <Grafico lineData={lineData} pieData={pieData} />
            </div>
            <Quadro />
          </div>
        </div>
      </div>

      {/* Popup */}
      {showPopup && <ModalTransacao onClose={handleClosePopup} />}
    </div>
  );
}
