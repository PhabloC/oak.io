import { useState } from "react";
import { IoClose } from "react-icons/io5";

export default function ModalAporte({ ativo, onClose, onSave }) {
  const [valorAporte, setValorAporte] = useState("");
  const [novoValorAtual, setNovoValorAtual] = useState("");

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const aporte = parseCurrencyToNumber(valorAporte);
    const novo = parseCurrencyToNumber(novoValorAtual);

    if (aporte <= 0) {
      alert("Informe o valor do aporte.");
      return;
    }

    onSave(
      aporte,
      novo > 0 ? novo : aporte + Number(ativo?.valor_atual || 0)
    );
    onClose();
  };

  const valorAtualNum = Number(ativo?.valor_atual || 0);
  const aporteNum = parseCurrencyToNumber(valorAporte);
  const sugestaoValorAtual = valorAtualNum + aporteNum;

  if (!ativo) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-2 animate-fadeIn overflow-y-auto py-4">
      <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 p-6 sm:p-8 rounded-xl shadow-2xl shadow-purple-500/20 w-full max-w-md border border-gray-700/50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            Adicionar investimento
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <IoClose className="text-2xl" />
          </button>
        </div>

        <p className="text-gray-400 mb-4">
          Ativo: <span className="text-white font-medium">{ativo.nome}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-indigo-200">
              Valor do aporte (R$)
            </label>
            <div className="flex items-center">
              <span className="bg-gray-700 text-white p-3 rounded-l-xl border border-gray-600/50 font-semibold">
                R$
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={valorAporte}
                onChange={(e) =>
                  setValorAporte(formatInputCurrency(e.target.value))
                }
                className="w-full p-3 rounded-r-xl bg-gray-700/50 text-white border border-gray-600/50 border-l-0 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                placeholder="0,00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-indigo-200">
              Valor de mercado após o aporte (R$)
            </label>
            <p className="text-xs text-gray-500 mb-1">
              Quanto o ativo está valendo no mercado. Opcional: se deixar em branco, será usado valor atual + aporte
            </p>
            <div className="flex items-center">
              <span className="bg-gray-700 text-white p-3 rounded-l-xl border border-gray-600/50 font-semibold">
                R$
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={novoValorAtual}
                onChange={(e) =>
                  setNovoValorAtual(formatInputCurrency(e.target.value))
                }
                className="w-full p-3 rounded-r-xl bg-gray-700/50 text-white border border-gray-600/50 border-l-0 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                placeholder={
                  aporteNum > 0
                    ? sugestaoValorAtual.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "0,00"
                }
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-gray-600 text-gray-300 hover:bg-gray-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-colors font-medium"
            >
              Registrar aporte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
