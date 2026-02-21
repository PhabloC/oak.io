import { useState } from "react";
import { IoClose } from "react-icons/io5";

const formatCurrency = (v) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(v || 0);

export default function ModalEditarValorMercado({ ativo, onClose, onSave }) {
  const [valorMercado, setValorMercado] = useState(
    ativo?.valor_atual?.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) || ""
  );

  const formatInputCurrency = (value) => {
    if (!value) return "";
    const numericValue = value.replace(/\D/g, "");
    if (!numericValue) return "";
    const number = parseInt(numericValue, 10) / 100;
    return number.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const parseCurrencyToNumber = (value) => {
    if (!value) return 0;
    const cleanValue = value.replace(/\./g, "").replace(",", ".");
    return parseFloat(cleanValue) || 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    const v = parseCurrencyToNumber(valorMercado);
    if (v <= 0) {
      alert("Valor na corretora deve ser maior que zero.");
      return;
    }
    onSave(v);
    onClose();
  };

  if (!ativo) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-2 animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-700/50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Editar valor na corretora</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <IoClose className="text-2xl" />
          </button>
        </div>

        <p className="text-gray-400 mb-2">
          Ativo: <span className="text-white font-medium">{ativo.nome}</span>
        </p>
        <div className="bg-gray-700/30 p-3 rounded-lg mb-4 text-sm">
          <div className="flex justify-between text-gray-400">
            <span>Total investido:</span>
            <span className="text-white">{formatCurrency(ativo.valor_investido)}</span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-indigo-200">
              Novo valor na corretora (R$)
            </label>
            <div className="flex items-center">
              <span className="bg-gray-700 text-white p-3 rounded-l-xl border border-gray-600/50 font-semibold">
                R$
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={valorMercado}
                onChange={(e) =>
                  setValorMercado(formatInputCurrency(e.target.value))
                }
                className="w-full p-3 rounded-r-xl bg-gray-700/50 text-white border border-gray-600/50 border-l-0 focus:border-purple-500 outline-none"
                placeholder="0,00"
                required
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-600 text-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
