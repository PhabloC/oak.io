import { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";

// Função para obter o nome do mês a partir de uma data YYYY-MM-DD
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
  const [, month] = dateString.split("-"); // e.g., "2025-05-01" -> "05"
  return months[parseInt(month, 10) - 1];
};

const editTransaction = async (transactionId, updatedData) => {
  try {
    const userId = auth.currentUser.uid;
    const transactionRef = doc(
      db,
      "users",
      userId,
      "transactions",
      transactionId
    );
    await updateDoc(transactionRef, updatedData);
    console.log("Transação atualizada com sucesso!");
  } catch (error) {
    console.error("Erro ao atualizar transação:", error);
  }
};

export default function ModalEditor({
  transaction,
  onClose,
  onDelete,
  onSave,
}) {
  // Estados locais para os campos do formulário
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState("Ganho");
  const [method, setMethod] = useState("Boleto");
  const [date, setDate] = useState("");

  // Calcula a data máxima (hoje) no formato YYYY-MM-DD
  const maxDate = new Date().toISOString().split("T")[0];

  // Inicializa os estados com os valores da transação
  useEffect(() => {
    if (transaction) {
      setTitle(transaction.title || "");
      setValue(transaction.value || "");
      setType(transaction.type || "Ganho");
      setMethod(transaction.method || "Boleto");
      setDate(transaction.date || "");
    }
  }, [transaction]);

  const handleSaveEdit = async () => {
    // Validação dos campos obrigatórios
    if (!title || !value || !date) {
      alert("Por favor, preencha todos os campos obrigatórios!");
      return;
    }

    // Validação para impedir datas futuras
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate > today) {
      alert("Não é possível selecionar datas futuras!");
      return;
    }

    // Determina a data a ser salva (formato YYYY-MM-DD)
    const transactionDate = date;

    // Determina o mês com base na data
    const transactionMonth = getMonthName(date);
    const capitalizedMonth =
      transactionMonth.charAt(0).toUpperCase() + transactionMonth.slice(1);

    const updatedTransaction = {
      title,
      value: parseFloat(value),
      type,
      method,
      date: transactionDate,
      month: capitalizedMonth,
    };

    await editTransaction(transaction.id, updatedTransaction);

    // Atualiza o estado no componente pai
    onSave(updatedTransaction, transaction.id);
    onClose();
  };

  const handleDeleteTransaction = async () => {
    try {
      await onDelete(transaction.id);
      onClose();
    } catch (error) {
      console.error("Erro ao deletar transação:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-[400px] relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Editar Transação</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg"
          >
            X
          </button>
        </div>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-white">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-700 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-white">
              Valor
            </label>
            <div className="flex items-center">
              <span className="bg-gray-700 text-white p-2 rounded-l-lg">
                R$
              </span>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full p-2 rounded-r-lg bg-gray-700 text-white"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-white">
              Tipo
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-700 text-white"
              required
            >
              <option value="Ganho">Ganho</option>
              <option value="Gasto">Gasto</option>
              <option value="Investimento">Investimento</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-white">
              Método
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-700 text-white"
            >
              <option value="Boleto">Boleto</option>
              <option value="Pix">Pix</option>
              <option value="Cartão">Cartão</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-white">
              Data
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={maxDate}
              className="w-full p-2 rounded-lg bg-gray-700 text-white"
              required
            />
          </div>
        </form>
        <button
          onClick={handleDeleteTransaction}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 flex items-center gap-2 mt-4 w-full justify-center"
        >
          <FaTrash />
          Deletar Transação
        </button>
        <div className="flex gap-4 mt-4 justify-center text-center">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveEdit}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-500"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
