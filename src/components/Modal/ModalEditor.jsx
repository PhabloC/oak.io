import { FaTrash } from "react-icons/fa";

export default function ModalEditor({
  transaction,
  onClose,
  onDelete,
  onSave,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-[400px] relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Transação</h2>
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
              value={transaction.title}
              onChange={(e) =>
                onSave({ ...transaction, title: e.target.value })
              }
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
                value={transaction.value}
                onChange={(e) =>
                  onSave({ ...transaction, value: e.target.value })
                }
                className="w-full p-2 rounded-r-lg bg-gray-700 text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <select
              value={transaction.type}
              onChange={(e) => onSave({ ...transaction, type: e.target.value })}
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
              value={transaction.method}
              onChange={(e) =>
                onSave({ ...transaction, method: e.target.value })
              }
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
              value={transaction.date}
              onChange={(e) => onSave({ ...transaction, date: e.target.value })}
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
        <div className="flex  gap-4 mt-4 justify-center text-center">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(transaction)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-500"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
