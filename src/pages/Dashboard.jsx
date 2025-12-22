import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import Grafico from "../components/Grafico/Grafico";
import Cards from "../components/Cards/Cards";
import Quadro from "../components/Quadro/Quadro";
import { BsDatabaseFillAdd } from "react-icons/bs";
import ModalTransacao from "../components/Modal/ModalTransacao";
import { useTransactions } from "../context/TransactionsContext";

// Função para obter o número de dias em um mês
const getDaysInMonth = (month, year) => {
  const monthIndex = [
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
  ].indexOf(month);
  return new Date(year, monthIndex + 1, 0).getDate();
};

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
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
      }
    };

    checkAuth();
  }, [navigate]);

  const showSidebar =
    location.pathname === "/dashboard" || location.pathname === "/transacoes";

  // Função para carregar transações do Firestore
  const loadTransactions = async (month) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/");
        return;
      }

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .eq("month", month)
        .order("date", { ascending: true });

      if (error) {
        console.error("Erro ao carregar transações:", error);
        return;
      }

      setTransactions(data || []);
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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/");
        return;
      }

      const newTransaction = {
        ...transaction,
        month: selectedMonth,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from("transactions")
        .insert([newTransaction])
        .select()
        .single();

      if (error) {
        console.error("Erro ao adicionar transação:", error);
        return;
      }

      const savedTransaction = data;

      // Atualiza o estado global
      const updatedTransactions = [...transactions, savedTransaction];
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
  const year = new Date().getFullYear(); // Usa o ano atual
  const daysInMonth = getDaysInMonth(selectedMonth, year);
  const labels = Array.from({ length: daysInMonth }, (_, i) =>
    (i + 1).toString()
  );

  const lineData = {
    labels,
    datasets: [
      {
        label: "Ganhos",
        data: labels.map((day) =>
          transactions
            .filter(
              (t) =>
                t.type === "Ganho" &&
                t.month === selectedMonth &&
                t.date.endsWith(`-${day.padStart(2, "0")}`)
            )
            .reduce((acc, t) => acc + t.value, 0)
        ),
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Gastos",
        data: labels.map((day) =>
          transactions
            .filter(
              (t) =>
                t.type === "Gasto" &&
                t.month === selectedMonth &&
                t.date.endsWith(`-${day.padStart(2, "0")}`)
            )
            .reduce((acc, t) => acc + Math.abs(t.value), 0)
        ),
        borderColor: "#F44336",
        backgroundColor: "rgba(244, 67, 54, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Investimentos",
        data: labels.map((day) =>
          transactions
            .filter(
              (t) =>
                t.type === "Investimento" &&
                t.month === selectedMonth &&
                t.date.endsWith(`-${day.padStart(2, "0")}`)
            )
            .reduce((acc, t) => acc + Math.abs(t.value), 0)
        ),
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
              <Grafico
                lineData={lineData}
                pieData={pieData}
                selectedMonth={selectedMonth}
              />
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
