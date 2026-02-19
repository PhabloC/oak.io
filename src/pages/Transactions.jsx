import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import Cards from "../components/Cards/Cards";
import { BsDatabaseFillAdd } from "react-icons/bs";
import ModalTransacao from "../components/Modal/ModalTransacao";
import ModalEditor from "../components/Modal/ModalEditor";
import ModalDeleted from "../components/Modal/ModalDeleted";
import { useTransactions } from "../context/TransactionsContext";
import TransactionsTable from "../components/Table/TransactionsTable";
import { getAllCategories } from "../utils/categories";
import { FaSearch, FaFilter, FaTimes } from "react-icons/fa";

export default function Transactions() {
  const navigate = useNavigate();
  const location = useLocation();
  const { transactions, setTransactions } = useTransactions();
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("Todos");
  const [filterCategory, setFilterCategory] = useState("Todas");
  const [filterMethod, setFilterMethod] = useState("Todos");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");

  // Define o mês atual com a primeira letra maiúscula
  const currentMonth = new Date()
    .toLocaleString("pt-BR", { month: "long" })
    .replace(/^\w/, (c) => c.toUpperCase());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

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
    const checkAndLoad = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/");
        return;
      }

      await loadTransactions(selectedMonth, user.id);
    };

    checkAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, selectedMonth]);

  // Ajuste os itens por página com base no tamanho da tela

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(5); // Mobile
      } else if (window.innerWidth < 1550) {
        setItemsPerPage(8); // Notebook
      } else {
        setItemsPerPage(10); // Desktop/Monitor
      }
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  const showSidebar =
    location.pathname === "/dashboard" || location.pathname === "/transacoes";

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

      const loadedTransactions = (data || []).map((row) => {
        const dateMonth = getMonthName(row.date);
        const capitalizedDateMonth =
          dateMonth.charAt(0).toUpperCase() + dateMonth.slice(1);
        if (row.month !== capitalizedDateMonth) {
          console.warn(
            `Mês inconsistente para transação ${row.id}: date=${row.date}, month=${row.month}, deveria ser ${capitalizedDateMonth}`
          );
        }
        return row;
      });

      setTransactions(loadedTransactions);
      setCurrentPage(1); // Redefinir para a primeira página quando as transações forem carregadas
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
    }
  };

  const getMonthName = (dateString) => {
    const months = [
      "janeiro",
      "fevereiro",
      "março",
      "abril",
      "maio",
      "junho",
      "julho",
      "agosto",
      "setembro",
      "outubro",
      "novembro",
      "dezembro",
    ];
    if (!dateString) return "";
    const [, month] = dateString.split("-");
    return months[parseInt(month, 10) - 1];
  };

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

      setTransactions((prev) => [...prev, data]);
      setShowPopup(false);
      setSuccessMessage("Transação adicionada com sucesso!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
    }
  };

  const handleUpdateTransaction = (updatedTransaction, transactionId) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === transactionId
          ? { id: transactionId, ...updatedTransaction }
          : t
      )
    );
    setSuccessMessage("Transação atualizada com sucesso!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleOpenEditor = (transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleCloseEditor = () => {
    setSelectedTransaction(null);
  };

  const handleDeleteTransaction = async (id) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/");
        return;
      }

      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Erro ao deletar transação:", error);
        return;
      }

      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setTransactionToDelete(null);
      setShowConfirmModal(false);
      setSuccessMessage("Transação deletada com sucesso!");
      setTimeout(() => setSuccessMessage(""), 3000);

      // Ajuste a página atual se necessário
      const remainingTransactions = transactions.filter((t) => t.id !== id);
      const totalPages = Math.ceil(remainingTransactions.length / itemsPerPage);
      if (currentPage > totalPages) {
        setCurrentPage(totalPages || 1);
      }
    } catch (error) {
      console.error("Erro ao deletar transação:", error);
    }
  };

  const handleOpenConfirmModal = (transaction) => {
    setTransactionToDelete(transaction);
    setShowConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setTransactionToDelete(null);
    setShowConfirmModal(false);
  };

  // Filter logic
  const filteredTransactions = transactions.filter((transaction) => {
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        transaction.title?.toLowerCase().includes(searchLower) ||
        transaction.description?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Type filter
    if (filterType !== "Todos" && transaction.type !== filterType) {
      return false;
    }

    // Category filter
    if (filterCategory !== "Todas") {
      if (!transaction.category || transaction.category !== filterCategory) {
        return false;
      }
    }

    // Method filter
    if (filterMethod !== "Todos" && transaction.method !== filterMethod) {
      return false;
    }

    // Value range filters
    if (minValue && transaction.value < parseFloat(minValue)) {
      return false;
    }
    if (maxValue && transaction.value > parseFloat(maxValue)) {
      return false;
    }

    return true;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterCategory, filterMethod, minValue, maxValue]);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("Todos");
    setFilterCategory("Todas");
    setFilterMethod("Todos");
    setMinValue("");
    setMaxValue("");
  };

  const hasActiveFilters =
    searchTerm ||
    filterType !== "Todos" ||
    filterCategory !== "Todas" ||
    filterMethod !== "Todos" ||
    minValue ||
    maxValue;

  // Calcula saldo, receita e despesa
  const { saldo, receita, despesa } = useMemo(() => {
    const receita = transactions
      .filter((t) => t.type === "Ganho")
      .reduce((acc, t) => acc + Math.abs(t.value), 0);
    const despesa = transactions
      .filter((t) => t.type === "Gasto")
      .reduce((acc, t) => acc + Math.abs(t.value), 0);
    const saldo = receita - despesa;
    return { saldo, receita, despesa };
  }, [transactions]);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Gerar números de página para telas maiores

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

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
        <div className="p-3 sm:p-4 md:ml-16 lg:ml-28 pb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Transações</h1>
            <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowPopup(true)}
                className="bg-gray-800 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-700 transition duration-300 flex-1 sm:flex-none"
              >
                <BsDatabaseFillAdd className="text-base sm:text-lg" />
                <span className="text-xs sm:text-sm whitespace-nowrap">
                  Nova transação
                </span>
              </button>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-gray-800 text-white px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm flex-1 sm:flex-none"
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
            <div className="bg-green-600 text-white px-3 py-2 rounded-lg mb-4 text-xs sm:text-sm">
              {successMessage}
            </div>
          )}

          {/* Cards de Saldo, Receita e Despesa */}
          <div className="mb-4 sm:mb-6">
            <Cards saldo={saldo} receita={receita} despesa={despesa} />
          </div>

          {/* Filtros e Busca */}
          <div className="bg-gradient-to-br from-gray-800/40 via-gray-800/30 to-gray-800/40 backdrop-blur-md p-3 sm:p-4 lg:p-6 rounded-xl shadow-xl shadow-purple-500/10 border border-indigo-500/20 mb-4 sm:mb-6">
            <div className="flex flex-row items-center justify-between gap-2 mb-3 sm:mb-4">
              <div className="flex items-center gap-2 text-indigo-200">
                <FaFilter className="text-sm sm:text-lg" />
                <h3 className="text-sm sm:text-lg font-semibold">Filtros</h3>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-lg text-xs sm:text-sm transition-all duration-200 border border-red-500/30"
                >
                  <FaTimes className="text-xs" />
                  <span className="hidden sm:inline">Limpar</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
              {/* Busca */}
              <div className="relative col-span-2 sm:col-span-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-3 py-2 sm:py-2.5 rounded-lg bg-gray-700/50 text-white border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none text-xs sm:text-sm placeholder:text-gray-500"
                />
              </div>

              {/* Filtro por Tipo */}
              <div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-gray-700/50 text-white border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none cursor-pointer text-xs sm:text-sm"
                >
                  <option value="Todos">Tipo</option>
                  <option value="Ganho">Ganho</option>
                  <option value="Gasto">Gasto</option>
                  <option value="Investimento">Investimento</option>
                </select>
              </div>

              {/* Filtro por Categoria */}
              <div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-gray-700/50 text-white border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none cursor-pointer text-xs sm:text-sm"
                >
                  <option value="Todas">Categoria</option>
                  {getAllCategories().map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Método */}
              <div>
                <select
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                  className="w-full px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-gray-700/50 text-white border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none cursor-pointer text-xs sm:text-sm"
                >
                  <option value="Todos">Método</option>
                  <option value="Pix">Pix</option>
                  <option value="Cartão">Cartão</option>
                  <option value="Boleto">Boleto</option>
                </select>
              </div>

              {/* Filtro por Valor Mínimo */}
              <div>
                <input
                  type="number"
                  placeholder="Mín R$"
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                  className="w-full px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-gray-700/50 text-white border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none text-xs sm:text-sm placeholder:text-gray-500"
                  step="0.01"
                  min="0"
                />
              </div>

              {/* Filtro por Valor Máximo */}
              <div>
                <input
                  type="number"
                  placeholder="Máx R$"
                  value={maxValue}
                  onChange={(e) => setMaxValue(e.target.value)}
                  className="w-full px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-gray-700/50 text-white border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none text-xs sm:text-sm placeholder:text-gray-500"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-3 pt-3 border-t border-gray-700/50">
                <p className="text-xs sm:text-sm text-gray-400">
                  <span className="font-semibold text-white">{filteredTransactions.length}</span> de{" "}
                  <span className="font-semibold text-white">{transactions.length}</span> transações
                </p>
              </div>
            )}
          </div>

          <TransactionsTable
            transactions={currentTransactions}
            onEdit={handleOpenEditor}
            onDelete={handleOpenConfirmModal}
          />

          {/* Controle de páginação */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-2 mt-4">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm ${
                  currentPage === 1
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gray-800 hover:bg-gray-700"
                } text-white transition duration-300 min-w-[80px] sm:min-w-[100px]`}
              >
                Anterior
              </button>
              {/* Números de página para telas maiores
               */}
              <div className="hidden lg:flex gap-1">
                {pageNumbers.map((number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm ${
                      currentPage === number
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 hover:bg-gray-700 text-white"
                    } transition duration-300`}
                  >
                    {number}
                  </button>
                ))}
              </div>
              <span className="text-white text-xs sm:text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm ${
                  currentPage === totalPages
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gray-800 hover:bg-gray-700"
                } text-white transition duration-300 min-w-[80px] sm:min-w-[100px]`}
              >
                Próximo
              </button>
            </div>
          )}
        </div>
      </div>

      {showPopup && (
        <ModalTransacao
          onClose={handleClosePopup}
          onSave={handleAddTransaction}
        />
      )}

      {selectedTransaction && (
        <ModalEditor
          transaction={selectedTransaction}
          onClose={handleCloseEditor}
          onDelete={handleDeleteTransaction}
          onSave={handleUpdateTransaction}
        />
      )}

      {showConfirmModal && (
        <ModalDeleted
          onClose={handleCloseConfirmModal}
          onDelete={() => handleDeleteTransaction(transactionToDelete.id)}
        />
      )}
    </div>
  );
}
