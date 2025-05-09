import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
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

  // Define o mês atual com a primeira letra maiúscula
  const currentMonth = new Date()
    .toLocaleString("pt-BR", {
      month: "long",
    })
    .replace(/^\w/, (c) => c.toUpperCase());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [showPopup, setShowPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
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
  const calculateDashboardData = (transactions, month) => {
    // Filtra transações pelo mês selecionado
    const filteredTransactions = transactions.filter((t) => t.month === month);

    const saldo = filteredTransactions.reduce(
      (acc, t) =>
        t.type === "Ganho" ? acc + t.value : acc - Math.abs(t.value),
      0
    );
    const gastos = filteredTransactions
      .filter((t) => t.type === "Gasto")
      .reduce((acc, t) => acc + Math.abs(t.value), 0);
    const investimentos = filteredTransactions
      .filter((t) => t.type === "Investimento")
      .reduce((acc, t) => acc + Math.abs(t.value), 0);

    return { saldo, gastos, investimentos };
  };

  // Atualiza os dados do Dashboard sempre que as transações ou o mês mudarem
  useEffect(() => {
    loadTransactions(selectedMonth);
  }, [selectedMonth]);

  useEffect(() => {
    const data = calculateDashboardData(transactions, selectedMonth);
    setDashboardData(data);
  }, [transactions, selectedMonth]);

  const handleAddTransaction = async (transaction) => {
    try {
      const userId = auth.currentUser.uid;
      const transactionsRef = collection(db, "users", userId, "transactions");
      const newTransaction = { ...transaction, month: selectedMonth };
      const docRef = await addDoc(transactionsRef, newTransaction);

      // Atualiza o estado global
      const updatedTransactions = [
        ...transactions,
        { id: docRef.id, ...newTransaction },
      ];
      setTransactions(updatedTransactions);

      // Recalcula os dados do dashboard
      const updatedData = calculateDashboardData(
        updatedTransactions,
        selectedMonth
      );
      setDashboardData(updatedData);

      setShowPopup(false);
      setSuccessMessage("Transação adicionada com sucesso!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  // Dados para o gráfico de linha
  const lineData = {
    labels: [selectedMonth],
    datasets: [
      {
        label: "Ganhos",
        data: [
          transactions
            .filter((t) => t.type === "Ganho" && t.month === selectedMonth)
            .reduce((acc, t) => acc + t.value, 0),
        ],
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Gastos",
        data: [
          transactions
            .filter((t) => t.type === "Gasto" && t.month === selectedMonth)
            .reduce((acc, t) => acc + Math.abs(t.value), 0),
        ],
        borderColor: "#F44336",
        backgroundColor: "rgba(244, 67, 54, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Investimentos",
        data: [
          transactions
            .filter(
              (t) => t.type === "Investimento" && t.month === selectedMonth
            )
            .reduce((acc, t) => acc + Math.abs(t.value), 0),
        ],
        borderColor: "#2196F3",
        backgroundColor: "rgba(33, 150, 243, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Dados para o gráfico de pizza
  const pieData = {
    labels: ["Ganhos", "Gastos", "Investimentos"],
    datasets: [
      {
        data: [
          transactions
            .filter((t) => t.type === "Ganho" && t.month === selectedMonth)
            .reduce((acc, t) => acc + t.value, 0),
          transactions
            .filter((t) => t.type === "Gasto" && t.month === selectedMonth)
            .reduce((acc, t) => acc + Math.abs(t.value), 0),
          transactions
            .filter(
              (t) => t.type === "Investimento" && t.month === selectedMonth
            )
            .reduce((acc, t) => acc + Math.abs(t.value), 0),
        ],
        backgroundColor: ["#4CAF50", "#F44336", "#2196F3"],
        borderColor: ["#ffffff"],
        borderWidth: 2,
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
                onClick={() => setShowPopup(true)}
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

          {successMessage && (
            <div className="bg-green-600 text-white p-2 rounded-lg mb-4">
              {successMessage}
            </div>
          )}

          <div className="flex flex-1">
            <div className="flex flex-col gap-8 flex-1">
              <Cards
                saldo={dashboardData.saldo}
                gastos={dashboardData.gastos}
                investimentos={dashboardData.investimentos}
              />
              <Grafico lineData={lineData} pieData={pieData} />
            </div>
            <Quadro selectedMonth={selectedMonth} />
          </div>
        </div>
      </div>

      {showPopup && (
        <ModalTransacao
          onClose={handleClosePopup}
          onSave={handleAddTransaction}
        />
      )}
    </div>
  );
}
