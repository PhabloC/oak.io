import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";

const formatCurrency = (v) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(v || 0);

export default function ModalInvestimento({ ativos = [], ativoPreSelecionado = null, onClose, onSave }) {
  const [ativoSelecionado, setAtivoSelecionado] = useState(
    ativoPreSelecionado || (ativos.length > 0 ? ativos[0] : null)
  );

  useEffect(() => {
    if (ativoPreSelecionado) {
      setAtivoSelecionado(ativoPreSelecionado);
    } else if (ativos.length > 0 && !ativoPreSelecionado) {
      setAtivoSelecionado(ativos[0]);
    }
  }, [ativoPreSelecionado, ativos]);
  const [valorInvestimento, setValorInvestimento] = useState("");
  const [novoValorMercado, setNovoValorMercado] = useState("");

  const formatInputCurrency = (value) => {
    if (!value) return "";
    const n = value.replace(/\D/g, "");
    if (!n) return "";
    return (parseInt(n, 10) / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const parseNum = (v) => {
    if (!v) return 0;
    const c = String(v).replace(/\./g, "").replace(",", ".");
    return parseFloat(c) || 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const valor = parseNum(valorInvestimento);
    const novo = parseNum(novoValorMercado);
    if (!ativoSelecionado || valor <= 0) {
      alert("Selecione um ativo e informe o valor do investimento.");
      return;
    }
    const novoValorAtual =
      novo > 0 ? novo : Number(ativoSelecionado.valor_atual || 0) + valor;
    onSave(ativoSelecionado, valor, novoValorAtual);
    onClose();
  };

  const valorInvestido = Number(ativoSelecionado?.valor_investido || 0);
  const valorAtual = Number(ativoSelecionado?.valor_atual || 0);
  const aporteNum = parseNum(valorInvestimento);
  const sugestaoValorMercado = valorAtual + aporteNum;

  if (ativos.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-2">
        <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Cadastrar investimento</h2>
          <p className="text-gray-400 mb-4">
            Cadastre um ativo antes de registrar investimentos.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg bg-indigo-600 text-white"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-2 animate-fadeIn overflow-y-auto py-4">
      <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-700/50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Cadastrar investimento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <IoClose className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-indigo-200">
              Selecione o ativo
            </label>
            <select
              value={ativoSelecionado?.id || ""}
              onChange={(e) => {
                const a = ativos.find((x) => x.id === e.target.value);
                setAtivoSelecionado(a || null);
              }}
              className="w-full p-3 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:border-purple-500 outline-none cursor-pointer"
            >
              {ativos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome} {a.ticker ? `(${a.ticker})` : ""}
                </option>
              ))}
            </select>
          </div>

          {ativoSelecionado && (
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <p className="text-gray-400 text-sm mb-2">Patrimônio do ativo</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total investido:</span>
                <span className="text-white">{formatCurrency(valorInvestido)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-400">Valor de mercado:</span>
                <span className="text-emerald-400">{formatCurrency(valorAtual)}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-indigo-200">
              Valor do investimento (R$)
            </label>
            <div className="flex items-center">
              <span className="bg-gray-700 text-white p-3 rounded-l-xl border border-gray-600/50 font-semibold">R$</span>
              <input
                type="text"
                inputMode="numeric"
                value={valorInvestimento}
                onChange={(e) =>
                  setValorInvestimento(formatInputCurrency(e.target.value))
                }
                className="w-full p-3 rounded-r-xl bg-gray-700/50 text-white border border-gray-600/50 border-l-0 focus:border-purple-500 outline-none"
                placeholder="0,00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-indigo-200">
              Valor de mercado após o investimento (R$)
            </label>
            <p className="text-xs text-gray-500 mb-1">
              Opcional. Se deixar em branco: valor atual + investimento
            </p>
            <div className="flex items-center">
              <span className="bg-gray-700 text-white p-3 rounded-l-xl border border-gray-600/50 font-semibold">R$</span>
              <input
                type="text"
                inputMode="numeric"
                value={novoValorMercado}
                onChange={(e) =>
                  setNovoValorMercado(formatInputCurrency(e.target.value))
                }
                className="w-full p-3 rounded-r-xl bg-gray-700/50 text-white border border-gray-600/50 border-l-0 focus:border-purple-500 outline-none"
                placeholder={
                  aporteNum > 0
                    ? sugestaoValorMercado.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "0,00"
                }
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-gray-600 text-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-medium"
            >
              Registrar investimento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
