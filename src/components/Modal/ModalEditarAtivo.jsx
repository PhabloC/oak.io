import { useState, useMemo, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { FaShieldHalved } from "react-icons/fa6";

const TIPOS_ATIVO = [
  { value: "acoes", label: "Ações" },
  { value: "fiis", label: "FIIs" },
  { value: "tesouro_selic", label: "Tesouro Selic" },
  { value: "acoes_exterior", label: "Ações Exterior" },
  { value: "etf_exterior", label: "ETF Exterior" },
  { value: "cripto", label: "Criptomoedas" },
];

export default function ModalEditarAtivo({ ativo, onClose, onSave }) {
  const [nome, setNome] = useState(ativo?.nome || "");
  const [ticker, setTicker] = useState(ativo?.ticker || "");
  
  const tipoInicial = useMemo(() => {
    const tipoAtivo = ativo?.tipo || "acoes";
    const tipoExiste = TIPOS_ATIVO.some(t => t.value === tipoAtivo);
    return tipoExiste ? tipoAtivo : "acoes";
  }, [ativo?.tipo]);
  
  const [tipo, setTipo] = useState(tipoInicial);
  const [emergencia, setEmergencia] = useState(ativo?.emergencia === true);

  useEffect(() => {
    setEmergencia(ativo?.emergencia === true);
  }, [ativo?.emergencia]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!nome.trim()) {
      alert("Informe o nome do ativo.");
      return;
    }
    onSave({
      nome: nome.trim(),
      ticker: ticker.trim() || null,
      tipo,
      emergencia,
    });
    onClose();
  };

  if (!ativo) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-2 animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-700/50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Editar ativo</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
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
              className="w-full p-3 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:border-purple-500 outline-none"
              placeholder="Ex: Bitcoin, AAPL"
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
              className="w-full p-3 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:border-purple-500 outline-none uppercase"
              placeholder="Ex: BTC, AAPL"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-indigo-200">
              Tipo de ativo
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:border-purple-500 outline-none cursor-pointer"
            >
              {TIPOS_ATIVO.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <label
            htmlFor="emergencia-edit"
            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:border-amber-500/50 ${
              emergencia
                ? "bg-amber-500/10 border-amber-500/50 shadow-sm shadow-amber-500/10"
                : "bg-gray-700/30 border-gray-600/50 hover:bg-gray-700/50"
            }`}
          >
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                emergencia ? "bg-amber-500/20 text-amber-400" : "bg-gray-600/50 text-gray-400"
              }`}
            >
              <FaShieldHalved className="text-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">
                Contabilizar na reserva de emergência
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Este ativo será incluído no cálculo da sua reserva
              </p>
            </div>
            <div className="relative flex-shrink-0">
              <input
                type="checkbox"
                id="emergencia-edit"
                checked={emergencia}
                onChange={(e) => setEmergencia(e.target.checked)}
                className="peer sr-only"
              />
              <div
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  emergencia ? "bg-amber-500" : "bg-gray-600"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-200 ease-out ${
                    emergencia ? "left-6" : "left-1"
                  }`}
                />
              </div>
            </div>
          </label>

          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-gray-600 text-gray-300 hover:bg-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 font-medium"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
