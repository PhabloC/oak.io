import { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import { supabase } from "../../supabaseClient";
import { DEFAULT_CATEGORIES } from "../../utils/categories";

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
  const [, month] = dateString.split("-");
  return months[parseInt(month, 10) - 1];
};

const editTransaction = async (transactionId, updatedData) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    const { error } = await supabase
      .from("transactions")
      .update(updatedData)
      .eq("id", transactionId)
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }

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
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  // Inicializa os estados com os valores da transação
  useEffect(() => {
    if (transaction) {
      setTitle(transaction.title || "");
      setValue(transaction.value || "");
      setType(transaction.type || "Ganho");
      setMethod(transaction.method || "Boleto");
      setDate(transaction.date || "");
      setCategory(transaction.category || "");
      setDescription(transaction.description || "");
    }
  }, [transaction]);

  // Resetar categoria quando o tipo mudar
  const handleTypeChange = (newType) => {
    setType(newType);
    // Manter categoria apenas se ela existir para o novo tipo
    if (category && !DEFAULT_CATEGORIES[newType]?.includes(category)) {
      setCategory("");
    }
  };

  const handleSaveEdit = async () => {
    // Validação dos campos obrigatórios
    if (!title || !value || !date) {
      alert("Por favor, preencha todos os campos obrigatórios!");
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
      category: category || null,
      description: description || null,
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-2 animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 p-6 sm:p-8 rounded-xl shadow-2xl shadow-purple-500/20 w-full max-w-xs sm:max-w-md lg:max-w-2xl border border-gray-700/50 transition-all duration-300 animate-scaleIn max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Editar Transação
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl transition-all duration-200 hover:scale-110 hover:rotate-90 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-700/50"
          >
            ×
          </button>
        </div>
        <form className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium mb-2 text-indigo-200">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-indigo-200">
              Valor
            </label>
            <div className="flex items-center">
              <span className="bg-gradient-to-r from-gray-700 to-gray-600 text-white p-3 rounded-l-xl border border-gray-600/50 font-semibold">
                R$
              </span>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full p-3 rounded-r-xl bg-gray-700/50 text-white border border-gray-600/50 border-l-0 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-indigo-200">
              Data
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none cursor-pointer"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-indigo-200">
              Tipo
            </label>
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none cursor-pointer"
              required
            >
              <option value="Ganho">Ganho</option>
              <option value="Gasto">Gasto</option>
              <option value="Investimento">Investimento</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-indigo-200">
              Método
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none cursor-pointer"
            >
              <option value="Boleto">Boleto</option>
              <option value="Pix">Pix</option>
              <option value="Cartão">Cartão</option>
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium mb-2 text-indigo-200">
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none cursor-pointer"
            >
              <option value="">Selecione uma categoria</option>
              {(DEFAULT_CATEGORIES[type] || []).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium mb-2 text-indigo-200">
              Descrição (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none placeholder:text-gray-500 resize-none"
              placeholder="Adicione observações ou notas sobre esta transação..."
              rows="3"
            />
          </div>
        </form>
        <button
          onClick={handleDeleteTransaction}
          className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 rounded-xl hover:from-red-500 hover:to-red-600 flex items-center gap-2 mt-6 w-full justify-center transition-all duration-200 font-medium shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:scale-[1.02] border border-red-500/30"
        >
          <FaTrash />
          Deletar Transação
        </button>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-500 hover:to-gray-600 w-full sm:w-auto transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] border border-gray-500/30"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveEdit}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-500 hover:to-green-600 w-full sm:w-auto transition-all duration-200 font-medium shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-[1.02] border border-green-500/30"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
