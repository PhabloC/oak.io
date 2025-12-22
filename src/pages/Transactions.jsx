import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import { BsDatabaseFillAdd } from "react-icons/bs";
import ModalTransacao from "../components/Modal/ModalTransacao";
import ModalEditor from "../components/Modal/ModalEditor";
import ModalDeleted from "../components/Modal/ModalDeleted";
import { useTransactions } from "../context/TransactionsContext";
import TransactionsTable from "../components/Table/TransactionsTable";

export default function Transactions() {
  const navigate = useNavigate();
  const location = useLocation();
  const { transactions, setTransactions } = useTransactions();
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

      const totalPages = Math.ceil(
        transactions.filter((t) => t.id !== id).length / itemsPerPage
      );
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

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = transactions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

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
      {showSidebar && <Sidebar />}
      <div className="flex-1">
        <Header />
        <div className="p-4 sm:ml-4 md:ml-16 lg:ml-28 mt-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold">Transações</h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={() => setShowPopup(true)}
                className="bg-gray-800 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition duration-300 w-full sm:w-auto"
              >
                <BsDatabaseFillAdd className="text-base sm:text-lg" />
                <span className="text-sm sm:text-base">
                  Adicionar transação
                </span>
              </button>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-gray-800 text-white px-3 py-2 rounded-lg w-full sm:w-auto text-sm sm:text-base"
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
            <div className="bg-green-600 text-white px-3 py-2 rounded-lg mb-4 text-sm sm:text-base">
              {successMessage}
            </div>
          )}

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
