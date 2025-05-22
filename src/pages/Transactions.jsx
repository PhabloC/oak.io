import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import { BsBoxArrowUpRight, BsDatabaseFillAdd } from "react-icons/bs";
import ModalTransacao from "../components/Modal/ModalTransacao";
import ModalEditor from "../components/Modal/ModalEditor";
import ModalDeleted from "../components/Modal/ModalDeleted";
import { FaTrash } from "react-icons/fa";
import { useTransactions } from "../context/TransactionsContext";

// Função para formatar data YYYY-MM-DD para DD/MM/YYYY
const formatDate = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

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
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default items per page

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
    if (auth.currentUser) {
      loadTransactions(selectedMonth);
    } else {
      navigate("/");
    }
  }, [navigate, selectedMonth]);

  // Adjust items per page based on screen size
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
      const userId = auth.currentUser.uid;
      const transactionsRef = collection(db, "users", userId, "transactions");
      const q = query(transactionsRef, where("month", "==", month));
      const querySnapshot = await getDocs(q);

      const loadedTransactions = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const dateMonth = getMonthName(data.date);
        const capitalizedDateMonth =
          dateMonth.charAt(0).toUpperCase() + dateMonth.slice(1);
        if (data.month !== capitalizedDateMonth) {
          console.warn(
            `Mês inconsistente para transação ${doc.id}: date=${data.date}, month=${data.month}, deveria ser ${capitalizedDateMonth}`
          );
        }
        loadedTransactions.push({ id: doc.id, ...data });
      });

      setTransactions(loadedTransactions);
      setCurrentPage(1); // Reset to first page when transactions are loaded
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
      const userId = auth.currentUser.uid;
      const transactionsRef = collection(db, "users", userId, "transactions");

      const newTransaction = { ...transaction, month: selectedMonth };
      const docRef = await addDoc(transactionsRef, newTransaction);

      setTransactions((prev) => [
        ...prev,
        { id: docRef.id, ...newTransaction },
      ]);
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
      const userId = auth.currentUser.uid;
      const transactionRef = doc(db, "users", userId, "transactions", id);
      await deleteDoc(transactionRef);

      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setTransactionToDelete(null);
      setShowConfirmModal(false);
      setSuccessMessage("Transação deletada com sucesso!");
      setTimeout(() => setSuccessMessage(""), 3000);

      // Adjust current page if necessary
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

  // Generate page numbers for larger screens
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

          <div className="overflow-x-auto mt-8">
            <table className="w-full border-separate border-spacing-0 border border-slate-400 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="border border-slate-400 border-[1px] px-2 sm:px-4 py-1 sm:py-2 rounded-tl-lg text-xs sm:text-sm">
                    Nome
                  </th>
                  <th className="border border-slate-400 border-[1px] px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
                    Tipo
                  </th>
                  <th className="border border-slate-400 border-[1px] px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
                    Método
                  </th>
                  <th className="border border-slate-400 border-[1px] px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
                    Data
                  </th>
                  <th className="border border-slate-400 border-[1px] px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
                    Valor
                  </th>
                  <th className="border border-slate-400 border-[1px] px-2 sm:px-4 py-1 sm:py-2 rounded-tr-lg text-xs sm:text-sm">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentTransactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-4 text-gray-500 text-xs sm:text-sm"
                    >
                      Nenhuma transação encontrada.
                    </td>
                  </tr>
                ) : (
                  currentTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="text-center hover:bg-gray-600 bg-gray-700"
                    >
                      <td className="border border-slate-400 border-[1px] px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
                        {transaction.title}
                      </td>
                      <td className="border border-slate-400 border-[1px] px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
                        {transaction.type}
                      </td>
                      <td className="border border-slate-400 border-[1px] px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
                        {transaction.method}
                      </td>
                      <td className="border border-slate-400 border-[1px] px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
                        {formatDate(transaction.date)}
                      </td>
                      <td
                        className={`border border-slate-400 border-[1px] px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm ${
                          transaction.type === "Gasto"
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        {transaction.type === "Gasto"
                          ? `- R$ ${Math.abs(transaction.value).toFixed(2)}`
                          : `+ R$ ${transaction.value.toFixed(2)}`}
                      </td>
                      <td className="flex border border-slate-400 border-[1px] px-2 sm:px-4 py-1 sm:py-2 gap-2 justify-center items-center text-center">
                        <button
                          className="p-1 sm:p-2"
                          onClick={() => handleOpenEditor(transaction)}
                        >
                          <BsBoxArrowUpRight className="text-blue-500 text-sm sm:text-base" />
                        </button>
                        <button
                          className="p-1 sm:p-2"
                          onClick={() => handleOpenConfirmModal(transaction)}
                        >
                          <FaTrash className="text-red-500 text-sm sm:text-base" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
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
              {/* Page numbers for larger screens */}
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
