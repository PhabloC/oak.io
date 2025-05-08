import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebaseConfig";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import { BsBoxArrowUpRight, BsDatabaseFillAdd } from "react-icons/bs";
import ModalTransacao from "../components/Modal/ModalTransacao";
import ModalEditor from "../components/Modal/ModalEditor";
import ModalDeleted from "../components/Modal/ModalDeleted"; // Importa corretamente o ModalDeleted
import { FaTrash } from "react-icons/fa";

export default function Transitions() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      title: "Compra no mercado",
      value: -200,
      type: "Despesa",
      method: "Cartão",
      date: "2023-01-10",
    },
    {
      id: 2,
      title: "Salário",
      value: 5000,
      type: "Receita",
      method: "Pix",
      date: "2023-01-10",
    },
  ]);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Estado para o modal de confirmação
  const [transactionToDelete, setTransactionToDelete] = useState(null); // Transação a ser deletada
  const [successMessage, setSuccessMessage] = useState(""); // Mensagem de sucesso

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/");
    }
  }, [navigate]);

  const showSidebar =
    location.pathname === "/dashboard" || location.pathname === "/transacoes";

  const handleAddTransaction = () => {
    setShowPopup(true);
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

  const handleDeleteTransaction = (id) => {
    const updatedTransactions = transactions.filter((t) => t.id !== id);
    setTransactions(updatedTransactions);
    setTransactionToDelete(null);
    setShowConfirmModal(false);
    setSuccessMessage(
      "Transação deletada. A transação foi deletada do sistema."
    );
    setTimeout(() => setSuccessMessage(""), 3000); // Remove a mensagem após 3 segundos
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
            <button
              onClick={handleAddTransaction}
              className="bg-gray-800 text-white p-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition duration-300"
            >
              <BsDatabaseFillAdd className="text-lg" />
              <span>Adicionar transação</span>
            </button>
          </div>

          {/* Mensagem de Sucesso */}
          {successMessage && (
            <div className="bg-green-600 text-white p-2 rounded-lg mb-4">
              {successMessage}
            </div>
          )}

          <div className="overflow-x-auto mt-8">
            <table className="w-full border-collapse border border-gray-700 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="border border-gray-700 px-4 py-2">Nome</th>
                  <th className="border border-gray-700 px-4 py-2">Tipo</th>
                  <th className="border border-gray-700 px-4 py-2">Método</th>
                  <th className="border border-gray-700 px-4 py-2">Data</th>
                  <th className="border border-gray-700 px-4 py-2">Valor</th>
                  <th className="border border-gray-700 px-4 py-2">Ações</th>
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
                      className="hover:bg-gray-700 text-center"
                    >
                      <td className="border border-gray-700 px-4 py-2">
                        {transaction.title}
                      </td>
                      <td className="border border-gray-700 px-4 py-2">
                        {transaction.type}
                      </td>
                      <td className="border border-gray-700 px-4 py-2">
                        {transaction.method}
                      </td>
                      <td className="border border-gray-700 px-4 py-2">
                        {transaction.date}
                      </td>
                      <td
                        className={`border border-gray-700 px-4 py-2 ${
                          transaction.value < 0
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        {transaction.value < 0
                          ? `- R$ ${Math.abs(transaction.value)}`
                          : `+ R$ ${transaction.value}`}
                      </td>
                      <td className="border border-gray-700 px-4 py-2 flex gap-2 justify-center">
                        <BsBoxArrowUpRight
                          className="cursor-pointer text-blue-500"
                          onClick={() => handleOpenEditor(transaction)}
                        />
                        <FaTrash
                          className="cursor-pointer text-red-500"
                          onClick={() => handleOpenConfirmModal(transaction)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Adicionar Transação */}
      {showPopup && <ModalTransacao onClose={handleClosePopup} />}

      {/* Modal de Edição */}
      {selectedTransaction && (
        <ModalEditor
          transaction={selectedTransaction}
          onClose={handleCloseEditor}
          onDelete={handleDeleteTransaction}
          onSave={handleSaveTransaction}
        />
      )}

      {/* Modal de Confirmação */}
      {showConfirmModal && (
        <ModalDeleted
          onClose={handleCloseConfirmModal}
          onDelete={() => handleDeleteTransaction(transactionToDelete.id)}
        />
      )}
    </div>
  );
}
