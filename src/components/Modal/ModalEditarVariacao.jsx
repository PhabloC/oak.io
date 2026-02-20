import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { FaChartLine } from "react-icons/fa";

export default function ModalEditarVariacao({ ativo, onClose, onSave }) {
  const variacaoAtual = ativo?.variacao_percentual;
  const [tipoVariacao, setTipoVariacao] = useState(
    variacaoAtual != null
      ? variacaoAtual >= 0
        ? "valorizando"
        : "desvalorizando"
      : "valorizando"
  );
  const [percentual, setPercentual] = useState(
    variacaoAtual != null
      ? Math.abs(Number(variacaoAtual)).toString()
      : ""
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const p = parseFloat(percentual.replace(",", "."));
    if (isNaN(p) || p < 0) {
      alert("Informe um percentual válido.");
      return;
    }
    const valor = tipoVariacao === "valorizando" ? p : -p;
    onSave(valor);
    onClose();
  };

  if (!ativo) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-2 animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-700/50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FaChartLine className="text-indigo-400" />
            Informar variação
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
              O ativo está
            </label>
            <select
              value={tipoVariacao}
              onChange={(e) => setTipoVariacao(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:border-purple-500 outline-none cursor-pointer"
            >
              <option value="valorizando">Valorizando</option>
              <option value="desvalorizando">Desvalorizando</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-indigo-200">
              Em quantos por cento (%)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={percentual}
              onChange={(e) =>
                setPercentual(e.target.value.replace(/[^\d,.]/g, ""))
              }
              className="w-full p-3 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:border-purple-500 outline-none"
              placeholder="Ex: 5,5"
              required
            />
          </div>

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
