import { useState } from "react";
import { DEFAULT_CATEGORIES } from "../../utils/categories";

export default function ModalTransacao({ onClose, onSave }) {
  // Estados locais para os campos do formulário
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState("Ganho");
  const [method, setMethod] = useState("Boleto");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  // Resetar categoria quando o tipo mudar
  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory(""); // Resetar categoria quando tipo mudar
  };

  // Calcula a data máxima (hoje) no formato YYYY-MM-DD
  const maxDate = new Date().toISOString().split("T")[0];

  const handleSaveTransaction = async (e) => {
    e.preventDefault();

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

    const transaction = {
      title,
      value: parseFloat(value),
      type,
      method,
      date,
      category: category || null,
      description: description || null,
    };

    try {
      await onSave(transaction);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar a transação:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-2 animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 p-6 sm:p-8 rounded-xl shadow-2xl shadow-purple-500/20 w-full max-w-xs sm:max-w-md border border-gray-700/50 transition-all duration-300 animate-scaleIn max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Adicionar Transação
          </h2>
          <p className="text-gray-300 text-sm">
            Insira as informações abaixo:
          </p>
        </div>
        <form className="space-y-5" onSubmit={handleSaveTransaction}>
          <div>
            <label className="block text-sm font-medium mb-2 text-indigo-200">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none placeholder:text-gray-500"
              placeholder="Ex: Compra no mercado"
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
                className="w-full p-3 rounded-r-xl bg-gray-700/50 text-white border border-gray-600/50 border-l-0 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none placeholder:text-gray-500"
                placeholder="Ex: 200"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-indigo-200">
              Tipo de Transação
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
              Método de Pagamento
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
          <div>
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
          <div>
            <label className="block text-sm font-medium mb-2 text-indigo-200">
              Data
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={maxDate}
              className="w-full p-3 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none cursor-pointer"
              required
            />
          </div>
          <div>
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
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-500 hover:to-red-600 w-full sm:w-auto transition-all duration-200 font-medium shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:scale-[1.02] border border-red-500/30"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-500 hover:to-green-600 w-full sm:w-auto transition-all duration-200 font-medium shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-[1.02] border border-green-500/30"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
