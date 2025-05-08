import { useState } from "react";

export default function ModalTransacao({ onClose, onSave }) {
  // Estados locais para os campos do formulário
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState("Ganho");
  const [method, setMethod] = useState("Boleto");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");

  const handleSaveTransaction = async (e) => {
    e.preventDefault();

    // Validação dos campos obrigatórios
    if (!title || !value || !date) {
      alert("Por favor, preencha todos os campos obrigatórios!");
      return;
    }

    const transaction = {
      title,
      value: parseFloat(value), // Garante que o valor seja numérico
      type,
      method,
      category,
      date, // Salva a data fornecida pelo usuário
    };

    try {
      await onSave(transaction); // Passa os dados para o método handleAddTransaction
      onClose(); // Fecha o modal
    } catch (error) {
      console.error("Erro ao salvar a transação:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-[400px]">
        <h2 className="text-xl font-bold text-center">Adicionar Transação</h2>
        <p className="mb-4 text-center text-gray-400">
          Insira as informações abaixo:
        </p>
        <form className="space-y-4" onSubmit={handleSaveTransaction}>
          <div>
            <label className="block text-sm font-medium mb-1">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-700 text-white"
              placeholder="Ex: Compra no mercado"
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
                placeholder="Ex: 200"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Tipo de Transação
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-700 text-white"
            >
              <option value="Ganho">Ganho</option>
              <option value="Gasto">Gasto</option>
              <option value="Investimento">Investimento</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
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
            <label className="block text-sm font-medium mb-1">Categoria</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-700 text-white"
              placeholder="Ex: Alimentação"
            />
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
