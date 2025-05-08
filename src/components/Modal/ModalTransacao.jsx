export default function ModalTransacao({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-[400px]">
        <h2 className="text-xl font-bold  text-center">Adicionar Transação</h2>
        <p className="mb-4 text-center text-gray-400">
          Insira as informações abaixo:
        </p>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título</label>
            <input
              type="text"
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
                className="w-full p-2 rounded-r-lg bg-gray-700 text-white"
                placeholder="Ex: 200"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Tipo de Transação
            </label>
            <select className="w-full p-2 rounded-lg bg-gray-700 text-white">
              <option value="deposito">Ganho</option>
              <option value="gasto">Gasto</option>
              <option value="investimento">Investimento</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Método de Pagamento
            </label>
            <select className="w-full p-2 rounded-lg bg-gray-700 text-white">
              <option value="boleto">Boleto</option>
              <option value="pix">Pix</option>
              <option value="cartao">Cartão</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Categoria</label>
            <input
              type="text"
              className="w-full p-2 rounded-lg bg-gray-700 text-white"
              placeholder="Ex: Alimentação"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data</label>
            <input
              type="date"
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
