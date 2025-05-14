import { useState } from "react";

export default function ModalTransacao({ onClose, onSave }) {
  // Estados locais para os campos do formulário
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState("Ganho");
  const [method, setMethod] = useState("Boleto");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

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
    today.setHours(0, 0, 0, 0); // Normaliza para comparar apenas a data
    if (selectedDate > today) {
      alert("Não é possível selecionar datas futuras!");
      return;
    }

    const transaction = {
      title,
      value: parseFloat(value),
      type,
      method,
      date, // Já está em formato YYYY-MM-DD
    };

    try {
      await onSave(transaction);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar a transação:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-[400px]">
        <h2 className="text-xl font-bold text-center text-white">
          Adicionar Transação
        </h2>
        <p className="mb-4 text-center text-gray-400">
          Insira as informações abaixo:
        </p>
        <form className="space-y-4" onSubmit={handleSaveTransaction}>
          <div>
            <label className="block text-sm font-medium mb-1 text-white">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-700 text-white"
              placeholder="Ex: Compra no mercado"
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
                placeholder="Ex: 200"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-white">
              Tipo de Transação
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
              Método de Pagamento
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
          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-500"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
