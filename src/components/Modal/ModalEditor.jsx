import { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";

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
  const [value, setValue] = useState(0);
  const [type, setType] = useState("Despesa");
  const [method, setMethod] = useState("Cartão");
  const [date, setDate] = useState("");

  // Inicializa os estados com os valores da transação
  useEffect(() => {
    if (transaction) {
      setTitle(transaction.title || "");
      setValue(transaction.value || 0);
      setType(transaction.type || "Despesa");
      setMethod(transaction.method || "Cartão");
      setDate(transaction.date || "");
    }
  }, [transaction]);

  const handleSaveEdit = async () => {
    const updatedTransaction = {
      title,
      value: parseFloat(value), // Garante que o valor seja numérico
      type,
      method,
      date,
      month: new Date(date).toLocaleString("pt-BR", {
        month: "long",
        year: "numeric",
      }),
    };

    await editTransaction(transaction.id, updatedTransaction); // Atualiza no Firestore
    onSave(updatedTransaction); // Atualiza no estado global ou local
    onClose(); // Fecha o modal
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-[400px] relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Editar Transação</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg"
          >
            X
          </button>
        </div>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-700 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Valor</label>
            <div className="flex items-center">
              <span className="bg-gray-700 text-white p-2 rounded-l-lg">
                R$
              </span>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full p-2 rounded-r-lg bg-gray-700 text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-700 text-white"
            >
              <option value="Despesa">Despesa</option>
              <option value="Receita">Receita</option>
              <option value="Investimento">Investimento</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Método</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-700 text-white"
            >
              <option value="Cartão">Cartão</option>
              <option value="Pix">Pix</option>
              <option value="Boleto">Boleto</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-700 text-white"
            />
          </div>
        </form>
        <button
          onClick={() => onDelete(transaction.id)}
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
