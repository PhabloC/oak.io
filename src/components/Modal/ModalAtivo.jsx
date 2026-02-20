import { useState } from "react";
import { IoClose } from "react-icons/io5";

const TIPOS_ATIVO = [
  { value: "acoes", label: "Ações" },
  { value: "fiis", label: "FIIs" },
  { value: "tesouro_selic", label: "Tesouro Selic" },
  { value: "acoes_exterior", label: "Ações Exterior" },
  { value: "etf_exterior", label: "ETF Exterior" },
  { value: "cripto", label: "Criptomoedas" },
];

export default function ModalAtivo({ onClose, onSave }) {
  const [nome, setNome] = useState("");
  const [ticker, setTicker] = useState("");
  const [tipo, setTipo] = useState("acoes");
  const [valorMercado, setValorMercado] = useState("");
  const [taxaSelicAnual, setTaxaSelicAnual] = useState("");

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
    const vMercado = parseCurrencyToNumber(valorMercado);

    if (!nome.trim()) {
      alert("Informe o nome do ativo.");
      return;
    }
    if (tipo === "tesouro_selic" && !taxaSelicAnual.trim()) {
      alert("Informe a taxa Selic anual.");
      return;
    }

    const taxaSelic = tipo === "tesouro_selic"
      ? parseFloat(taxaSelicAnual.replace(",", ".")) || null
      : null;

    onSave({
      nome: nome.trim(),
      ticker: ticker.trim() || null,
      tipo,
      valor_atual: tipo === "tesouro_selic" ? 0 : vMercado,
      valor_investido: 0,
      quantidade: 1,
      data_compra: new Date().toISOString().split("T")[0],
      taxa_selic_anual: taxaSelic,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-2 animate-fadeIn overflow-y-auto py-4">
      <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 p-6 sm:p-8 rounded-xl shadow-2xl shadow-purple-500/20 w-full max-w-lg border border-gray-700/50 transition-all duration-300 animate-scaleIn max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Cadastrar ativo
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <IoClose className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-indigo-200">
              Nome do ativo
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              maxLength={100}
              className="w-full p-3 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
              placeholder="Ex: PETR4, Tesouro Selic 2029"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-indigo-200">
              Ticker (opcional)
            </label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none uppercase"
              placeholder="Ex: PETR4, HGLG11"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-indigo-200">
              Tipo de ativo
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none cursor-pointer"
            >
              {TIPOS_ATIVO.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {tipo === "tesouro_selic" && (
            <div>
              <label className="block text-sm font-medium mb-2 text-indigo-200">
                Taxa Selic anual (%)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={taxaSelicAnual}
                onChange={(e) =>
                  setTaxaSelicAnual(e.target.value.replace(/[^\d,.]/g, ""))
                }
                className="w-full p-3 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                placeholder="Ex: 10,75"
                required={tipo === "tesouro_selic"}
              />
            </div>
          )}

          {tipo !== "tesouro_selic" && (
            <div>
              <label className="block text-sm font-medium mb-2 text-indigo-200">
                Valor de mercado no momento (R$) - Opcional
              </label>
              <p className="text-xs text-gray-500 mb-1">
                Quanto o ativo está valendo hoje no mercado (pode informar depois)
              </p>
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
                  className="w-full p-3 rounded-r-xl bg-gray-700/50 text-white border border-gray-600/50 border-l-0 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                  placeholder="0,00"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-xl hover:from-indigo-500 hover:to-indigo-600 transition-colors font-medium"
            >
              Cadastrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
