import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import Cards from "../components/Cards/Cards";
import Quadro from "../components/Quadro/Quadro";
import { BsDatabaseFillAdd } from "react-icons/bs";
import ModalTransacao from "../components/Modal/ModalTransacao";
import { useTransactions } from "../context/TransactionsContext";
import GraficoBarras from "../components/Grafico/GraficoBarras";
import GraficoPizza from "../components/Grafico/GraficoPizza";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { transactions, setTransactions } = useTransactions();

  const currentMonth = new Date()
    .toLocaleString("pt-BR", {
      month: "long",
    })
    .replace(/^\w/, (c) => c.toUpperCase());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [showPopup, setShowPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    saldo: 0,
    receita: 0,
    despesa: 0,
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

    const receita = filteredTransactions
      .filter((t) => t.type === "Ganho")
      .reduce((acc, t) => acc + Math.abs(t.value), 0);
    const despesa = filteredTransactions
      .filter((t) => t.type === "Gasto")
      .reduce((acc, t) => acc + Math.abs(t.value), 0);
    const saldo = receita - despesa;

    return { saldo, receita, despesa };
  };

  // Atualiza os dados do Dashboard sempre que as transações ou o mês mudarem
  useEffect(() => {
    loadTransactions(selectedMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <div className="text-white flex min-h-screen">
      {showSidebar && (
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      )}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <div className="p-4 md:ml-28 ml-0 flex flex-col pb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={() => setShowPopup(true)}
                className="bg-gray-800 text-white p-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-700 transition duration-300"
              >
                <BsDatabaseFillAdd className="text-lg" />
                <span className="whitespace-nowrap">Adicionar transação</span>
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

          <div className="flex flex-col lg:flex-row flex-1 gap-6">
            <div className="flex flex-col gap-8 flex-1">
              <Cards
                saldo={dashboardData.saldo}
                receita={dashboardData.receita}
                despesa={dashboardData.despesa}
              />
              <div className="flex flex-col gap-6">
                <GraficoBarras
                  selectedMonth={selectedMonth}
                  transactions={transactions}
                />
                <GraficoPizza
                  selectedMonth={selectedMonth}
                  transactions={transactions}
                />
              </div>
            </div>
            <div className="w-full lg:w-auto">
              <Quadro selectedMonth={selectedMonth} />
            </div>
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
