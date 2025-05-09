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

export default function Transactions() {
  const navigate = useNavigate();
  const location = useLocation();
  const { transactions, setTransactions } = useTransactions();
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const currentMonth = new Date().toLocaleString("pt-BR", {
    month: "long",
  });
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
      loadTransactions(selectedMonth); // Carrega as transações do mês atual
    } else {
      navigate("/"); // Redireciona para a página inicial se o usuário não estiver autenticado
    }
  }, [navigate, selectedMonth]);

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
        loadedTransactions.push({ id: doc.id, ...doc.data() });
      });

      setTransactions(loadedTransactions);
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
    }
  };

  const handleAddTransaction = async (transaction) => {
    try {
      const userId = auth.currentUser.uid;
      const transactionsRef = collection(db, "users", userId, "transactions");

      // Adiciona o mês selecionado diretamente
      const newTransaction = { ...transaction, month: selectedMonth };
      const docRef = await addDoc(transactionsRef, newTransaction);

      // Atualiza o estado global imediatamente
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

  return (
    <div className="text-white flex">
      {showSidebar && <Sidebar />}
      <div className="flex-1">
        <Header />
        <div className="p-4 ml-28 mt-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Transações</h1>
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

          <div className="overflow-x-auto mt-8">
            <table className="w-full border-separate border-spacing-0 border border-white rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="border border-white border-[1px] px-4 py-2 rounded-tl-lg">
                    Nome
                  </th>
                  <th className="border border-white border-[1px] px-4 py-2">
                    Tipo
                  </th>
                  <th className="border border-white border-[1px] px-4 py-2">
                    Método
                  </th>
                  <th className="border border-white border-[1px] px-4 py-2">
                    Data
                  </th>
                  <th className="border border-white border-[1px] px-4 py-2">
                    Valor
                  </th>
                  <th className="border border-white border-[1px] px-4 py-2 rounded-tr-lg">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-500">
                      Nenhuma transação encontrada.
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="text-center hover:bg-gray-600 bg-gray-700"
                    >
                      <td className="border border-white border-[1px] px-4 py-2">
                        {transaction.title}
                      </td>
                      <td className="border border-white border-[1px] px-4 py-2">
                        {transaction.type}
                      </td>
                      <td className="border border-white border-[1px] px-4 py-2">
                        {transaction.method}
                      </td>
                      <td className="border border-white border-[1px] px-4 py-2">
                        {new Date(transaction.date).toLocaleDateString("pt-BR")}
                      </td>
                      <td
                        className={`border border-white border-[1px] px-4 py-2 ${
                          transaction.type === "Gasto"
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        {transaction.type === "Gasto"
                          ? `- R$ ${Math.abs(transaction.value)}`
                          : `+ R$ ${transaction.value}`}
                      </td>
                      <td className="flex border border-white border-[1px] px-4 py-2 gap-2 justify-center items-center text-center">
                        <button
                          className="p-2"
                          onClick={() => handleOpenEditor(transaction)}
                        >
                          <BsBoxArrowUpRight className="text-blue-500" />
                        </button>
                        <button
                          className="p-2  "
                          onClick={() => handleOpenConfirmModal(transaction)}
                        >
                          <FaTrash className="text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
          onSave={loadTransactions}
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
