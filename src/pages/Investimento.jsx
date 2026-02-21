import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaBalanceScale,
  FaHistory,
  FaFilter,
  FaPiggyBank,
  FaCog,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import ModalAtivo from "../components/Modal/ModalAtivo";
import ModalInvestimento from "../components/Modal/ModalInvestimento";
import ModalEditarValorMercado from "../components/Modal/ModalEditarValorMercado";
import ModalEditarAtivo from "../components/Modal/ModalEditarAtivo";
import ModalExcluirAtivo from "../components/Modal/ModalExcluirAtivo";
import ModalRemoverInvestimentos from "../components/Modal/ModalRemoverInvestimentos";
import GraficoTipoAtivo from "../components/Investimento/GraficoTipoAtivo";
import GraficoEvolucaoMensal from "../components/Investimento/GraficoEvolucaoMensal";
import SimuladorJurosCompostos from "../components/Investimento/SimuladorJurosCompostos";
import { BsFillShieldLockFill } from "react-icons/bs";

const TIPOS_LABEL = {
  acoes: "Ações",
  fiis: "FIIs",
  tesouro_selic: "Tesouro Selic",
  acoes_exterior: "Ações Exterior",
  etf_exterior: "ETF Exterior",
  cripto: "Criptomoedas",
};

const ALOCACAO_IDEAL = {
  acoes: 0.17,
  fiis: 0.17,
  tesouro_selic: 0.17,
  acoes_exterior: 0.16,
  etf_exterior: 0.16,
  cripto: 0.17,
};

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);

export default function Investimento() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [ativos, setAtivos] = useState([]);
  const [patrimonioHistorico, setPatrimonioHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModalAtivo, setShowModalAtivo] = useState(false);
  const [showModalInvestimento, setShowModalInvestimento] = useState(false);
  const [ativoPreSelecionadoInvestimento, setAtivoPreSelecionadoInvestimento] =
    useState(null);
  const [showModalEditarValor, setShowModalEditarValor] = useState(false);
  const [ativoParaEditarValor, setAtivoParaEditarValor] = useState(null);
  const [showModalEditarAtivo, setShowModalEditarAtivo] = useState(false);
  const [ativoParaEditar, setAtivoParaEditar] = useState(null);
  const [showModalExcluir, setShowModalExcluir] = useState(false);
  const [ativoParaExcluir, setAtivoParaExcluir] = useState(null);
  const [showModalRemoverInvestimentos, setShowModalRemoverInvestimentos] =
    useState(false);
  const [ativoParaRemoverInvestimentos, setAtivoParaRemoverInvestimentos] =
    useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [periodoInicio, setPeriodoInicio] = useState("");
  const [periodoFim, setPeriodoFim] = useState("");
  const [showFiltro, setShowFiltro] = useState(false);
  const [showRegistrarSnapshot, setShowRegistrarSnapshot] = useState(false);
  const [gastosMediosMensais, setGastosMediosMensais] = useState(0);
  const [pageAtivos, setPageAtivos] = useState(1);
  const [pageInvestimentos, setPageInvestimentos] = useState(1);

  const ITENS_POR_PAGINA = 6;

  const STORAGE_GASTO_MENSAL = "oak_reserva_gasto_mensal";
  const STORAGE_MESES_RESERVA = "oak_reserva_meses";
  const STORAGE_GASTO_LOCK = "oak_reserva_gasto_lock";

  const [gastoMensalManual, setGastoMensalManual] = useState(() => {
    try {
      const v = localStorage.getItem(STORAGE_GASTO_MENSAL);
      return v !== null ? v : "";
    } catch {
      return "";
    }
  });
  const [gastoEdit, setGastoEdit] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_GASTO_MENSAL) || "";
      return saved;
    } catch {
      return "";
    }
  });
  const [gastoLocked, setGastoLocked] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_GASTO_LOCK) === "true";
    } catch {
      return false;
    }
  });
  const [mesesReserva, setMesesReserva] = useState(() => {
    try {
      const v = localStorage.getItem(STORAGE_MESES_RESERVA);
      return v === "12" ? "12" : "6";
    } catch {
      return "6";
    }
  });

  const showSidebar =
    location.pathname === "/dashboard" ||
    location.pathname === "/transacoes" ||
    location.pathname === "/metas" ||
    location.pathname === "/dividas" ||
    location.pathname === "/investimento";

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) navigate("/");
    };
    checkAuth();
  }, [navigate]);

  const loadAtivos = async (userId) => {
    const { data, error } = await supabase
      .from("ativos")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (!error) setAtivos(data || []);
  };

  const loadPatrimonioHistorico = async (userId) => {
    const { data, error } = await supabase
      .from("patrimonio_historico")
      .select("*")
      .eq("user_id", userId)
      .order("ano", { ascending: true })
      .order("mes");
    if (!error) setPatrimonioHistorico(data || []);
  };

  const loadGastosUltimos6Meses = async (userId) => {
    const hoje = new Date();
    const dataFim = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate(),
    );
    const dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 6, 1);
    const startDate = dataInicio.toISOString().slice(0, 10);
    const endDate = dataFim.toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("transactions")
      .select("date, type, value")
      .eq("user_id", userId)
      .eq("type", "Gasto")
      .gte("date", startDate)
      .lte("date", endDate);
    if (error) return;
    const porMes = {};
    (data || []).forEach((t) => {
      const [y, m] = (t.date || "").split("-");
      const key = `${y}-${m}`;
      if (!porMes[key]) porMes[key] = 0;
      porMes[key] += Math.abs(Number(t.value) || 0);
    });
    const mesesComDados = Object.keys(porMes);
    const total = mesesComDados.reduce((s, k) => s + porMes[k], 0);
    const media = mesesComDados.length > 0 ? total / mesesComDados.length : 0;
    setGastosMediosMensais(media);
  };

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setLoading(true);
      await loadAtivos(user.id);
      await loadPatrimonioHistorico(user.id);
      await loadGastosUltimos6Meses(user.id);
      setLoading(false);
    };
    init();
  }, []);

  const valorMercadoEfetivo = (a) => {
    return Number(a.valor_atual || 0);
  };

  const patrimonioTotal = useMemo(() => {
    return ativos.reduce((s, a) => s + valorMercadoEfetivo(a), 0);
  }, [ativos]);

  const patrimonioEmergencia = useMemo(() => {
    return ativos
      .filter((a) => a.emergencia === true)
      .reduce((s, a) => s + valorMercadoEfetivo(a), 0);
  }, [ativos]);

  useEffect(() => {
    if (gastoLocked) {
      setGastoEdit(gastoMensalManual);
    }
  }, [gastoLocked, gastoMensalManual]);

  const handleSalvarGasto = () => {
    setGastoMensalManual(gastoEdit);
    try {
      localStorage.setItem(STORAGE_GASTO_MENSAL, gastoEdit);
      localStorage.setItem(STORAGE_GASTO_LOCK, "true");
    } catch {}
    setGastoLocked(true);
  };

  const handleEditarGasto = () => {
    setGastoEdit(gastoMensalManual);
    setGastoLocked(false);
    try {
      localStorage.setItem(STORAGE_GASTO_LOCK, "false");
    } catch {}
  };

  const gastoEditDirty = gastoEdit !== gastoMensalManual;
  const parseGastoNum = (v) => {
    if (!v) return 0;
    const c = String(v).replace(/\./g, "").replace(",", ".");
    return parseFloat(c) || 0;
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MESES_RESERVA, mesesReserva);
    } catch {}
  }, [mesesReserva]);

  const valorInvestidoTotal = useMemo(() => {
    return ativos.reduce((s, a) => s + Number(a.valor_investido || 0), 0);
  }, [ativos]);

  const ativosComInvestimento = useMemo(
    () => ativos.filter((a) => Number(a.valor_investido || 0) > 0),
    [ativos],
  );

  const ativosPaginados = useMemo(() => {
    const start = (pageAtivos - 1) * ITENS_POR_PAGINA;
    return ativos.slice(start, start + ITENS_POR_PAGINA);
  }, [ativos, pageAtivos]);

  const investimentosPaginados = useMemo(() => {
    const start = (pageInvestimentos - 1) * ITENS_POR_PAGINA;
    return ativosComInvestimento.slice(start, start + ITENS_POR_PAGINA);
  }, [ativosComInvestimento, pageInvestimentos]);

  const totalPaginasAtivos = Math.ceil(ativos.length / ITENS_POR_PAGINA) || 1;
  const totalPaginasInvestimentos =
    Math.ceil(ativosComInvestimento.length / ITENS_POR_PAGINA) || 1;

  useEffect(() => {
    if (pageAtivos > totalPaginasAtivos && totalPaginasAtivos > 0) {
      setPageAtivos(totalPaginasAtivos);
    }
  }, [pageAtivos, totalPaginasAtivos]);

  useEffect(() => {
    if (
      pageInvestimentos > totalPaginasInvestimentos &&
      totalPaginasInvestimentos > 0
    ) {
      setPageInvestimentos(totalPaginasInvestimentos);
    }
  }, [pageInvestimentos, totalPaginasInvestimentos]);

  const ativosParaGrafico = useMemo(
    () =>
      ativos.map((a) => ({
        ...a,
        valor_atual: valorMercadoEfetivo(a),
      })),
    [ativos],
  );

  const lucroPrejuizo = patrimonioTotal - valorInvestidoTotal;
  const percentualVariacao =
    valorInvestidoTotal > 0
      ? ((patrimonioTotal - valorInvestidoTotal) / valorInvestidoTotal) * 100
      : 0;

  const alocacaoAtual = useMemo(() => {
    if (patrimonioTotal <= 0) return {};
    return ativos.reduce((acc, a) => {
      const v = valorMercadoEfetivo(a);
      acc[a.tipo] = (acc[a.tipo] || 0) + v;
      return acc;
    }, {});
  }, [ativos, patrimonioTotal]);

  const alocacaoPercentuais = useMemo(() => {
    if (patrimonioTotal <= 0) return {};
    return Object.fromEntries(
      Object.entries(alocacaoAtual).map(([tipo, valor]) => [
        tipo,
        (valor / patrimonioTotal) * 100,
      ]),
    );
  }, [alocacaoAtual, patrimonioTotal]);

  const patrimonioHistoricoFiltrado = useMemo(() => {
    if (!periodoInicio || !periodoFim) return patrimonioHistorico;
    const [anoIni, mesIni] = periodoInicio.split("-").map(Number);
    const [anoFim, mesFim] = periodoFim.split("-").map(Number);
    const mesIndex = (m) => {
      const idx = MESES.findIndex((nome) =>
        nome.toLowerCase().startsWith(String(m).toLowerCase().slice(0, 3)),
      );
      return idx >= 0 ? idx + 1 : 1;
    };
    return patrimonioHistorico.filter((p) => {
      const v = (p.ano || 0) * 12 + mesIndex(p.mes);
      return v >= anoIni * 12 + mesIni && v <= anoFim * 12 + mesFim;
    });
  }, [patrimonioHistorico, periodoInicio, periodoFim]);

  const handleSaveAtivo = async (data) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    try {
      const payload = {
        nome: data.nome,
        ticker: data.ticker,
        tipo: data.tipo,
        valor_investido: data.valor_investido,
        valor_atual: data.valor_atual,
        quantidade: data.quantidade,
        data_compra: data.data_compra,
        taxa_selic_anual: data.taxa_selic_anual ?? null,
      };
      const { data: novo, error } = await supabase
        .from("ativos")
        .insert([{ ...payload, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      setAtivos((prev) => [novo, ...prev]);
      setShowModalAtivo(false);
      setSuccessMessage("Ativo cadastrado!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (e) {
      console.error(e);
      alert("Erro ao cadastrar ativo.");
    }
  };

  const handleEditarValorMercado = (ativo) => {
    setAtivoParaEditarValor(ativo);
    setShowModalEditarValor(true);
  };

  const handleSaveValorMercado = async (novoValor) => {
    if (!ativoParaEditarValor) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    try {
      const { error } = await supabase
        .from("ativos")
        .update({ valor_atual: novoValor })
        .eq("id", ativoParaEditarValor.id)
        .eq("user_id", user.id);
      if (error) throw error;
      setAtivos((prev) =>
        prev.map((a) =>
          a.id === ativoParaEditarValor.id
            ? { ...a, valor_atual: novoValor }
            : a,
        ),
      );
      setShowModalEditarValor(false);
      setAtivoParaEditarValor(null);
      setSuccessMessage("Valor de mercado atualizado!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (e) {
      console.error(e);
      alert("Erro ao atualizar valor.");
    }
  };

  const handleEditarAtivo = (ativo) => {
    setAtivoParaEditar(ativo);
    setShowModalEditarAtivo(true);
  };

  const handleSaveEditarAtivo = async (dados) => {
    if (!ativoParaEditar) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    try {
      const { error } = await supabase
        .from("ativos")
        .update({
          nome: dados.nome,
          ticker: dados.ticker,
          tipo: dados.tipo,
          emergencia: dados.emergencia ?? false,
        })
        .eq("id", ativoParaEditar.id)
        .eq("user_id", user.id);
      if (error) throw error;
      setAtivos((prev) =>
        prev.map((a) =>
          a.id === ativoParaEditar.id
            ? {
                ...a,
                nome: dados.nome,
                ticker: dados.ticker,
                tipo: dados.tipo,
                emergencia: dados.emergencia ?? false,
              }
            : a,
        ),
      );
      setShowModalEditarAtivo(false);
      setAtivoParaEditar(null);
      setSuccessMessage("Ativo atualizado!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (e) {
      console.error(e);
      alert("Erro ao atualizar ativo.");
    }
  };

  const handleOpenInvestimento = (ativo = null) => {
    setAtivoPreSelecionadoInvestimento(ativo);
    setShowModalInvestimento(true);
  };

  const handleSaveInvestimento = async (
    ativo,
    valorInvestimento,
    novoValorAtual,
    emergencia = null,
  ) => {
    if (!ativo || valorInvestimento <= 0) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const novoInvestido =
      Number(ativo.valor_investido || 0) + valorInvestimento;

    const updatePayload = {
      valor_investido: novoInvestido,
      valor_atual: novoValorAtual,
    };
    if (emergencia !== null) {
      updatePayload.emergencia = emergencia;
    }
    try {
      const { error } = await supabase
        .from("ativos")
        .update(updatePayload)
        .eq("id", ativo.id)
        .eq("user_id", user.id);

      if (error) throw error;

      setAtivos((prev) =>
        prev.map((a) =>
          a.id === ativo.id
            ? {
                ...a,
                valor_investido: novoInvestido,
                valor_atual: novoValorAtual,
                ...(emergencia !== null ? { emergencia } : {}),
              }
            : a,
        ),
      );
      setShowModalInvestimento(false);
      setAtivoPreSelecionadoInvestimento(null);
      setSuccessMessage("Investimento registrado!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (e) {
      console.error(e);
      alert("Erro ao registrar investimento.");
    }
  };

  const handleOpenExcluir = (ativo) => {
    setAtivoParaExcluir(ativo);
    setShowModalExcluir(true);
  };

  const handleOpenRemoverInvestimentos = (ativo) => {
    setAtivoParaRemoverInvestimentos(ativo);
    setShowModalRemoverInvestimentos(true);
  };

  const handleRemoverInvestimentos = async () => {
    if (!ativoParaRemoverInvestimentos) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    try {
      const { error } = await supabase
        .from("ativos")
        .update({ valor_investido: 0 })
        .eq("id", ativoParaRemoverInvestimentos.id)
        .eq("user_id", user.id);
      if (error) throw error;
      setAtivos((prev) =>
        prev.map((a) =>
          a.id === ativoParaRemoverInvestimentos.id
            ? { ...a, valor_investido: 0 }
            : a,
        ),
      );
      setShowModalRemoverInvestimentos(false);
      setAtivoParaRemoverInvestimentos(null);
      setSuccessMessage(
        "Investimentos removidos. O ativo permanece cadastrado.",
      );
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (e) {
      console.error(e);
      alert("Erro ao remover investimentos.");
      setShowModalRemoverInvestimentos(false);
      setAtivoParaRemoverInvestimentos(null);
    }
  };

  const handleConfirmDeleteAtivo = async () => {
    if (!ativoParaExcluir) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    try {
      const { error } = await supabase
        .from("ativos")
        .delete()
        .eq("id", ativoParaExcluir.id)
        .eq("user_id", user.id);
      if (error) throw error;
      setAtivos((prev) => prev.filter((a) => a.id !== ativoParaExcluir.id));
      setSuccessMessage("Ativo excluído.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (e) {
      console.error(e);
      alert("Erro ao excluir ativo.");
    }
    setShowModalExcluir(false);
    setAtivoParaExcluir(null);
  };

  const handleRegistrarSnapshot = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const hoje = new Date();
    const mes = MESES[hoje.getMonth()];
    const ano = hoje.getFullYear();
    try {
      await supabase
        .from("patrimonio_historico")
        .upsert(
          { user_id: user.id, total_patrimonio: patrimonioTotal, mes, ano },
          { onConflict: "user_id,mes,ano" },
        );
      await loadPatrimonioHistorico(user.id);
      setShowRegistrarSnapshot(false);
      setSuccessMessage("Snapshot registrado!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (e) {
      console.error(e);
      alert("Erro ao registrar snapshot.");
    }
  };

  if (loading) {
    return (
      <div className="text-white flex min-h-screen">
        {showSidebar && (
          <Sidebar
            isMobileOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        )}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
          <div className="p-4 md:ml-28 flex flex-col flex-1 items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
            <p className="text-gray-400 mt-4">Carregando investimentos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white flex min-h-screen">
      {showSidebar && (
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      )}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <div className="p-4 md:ml-28 ml-0 flex flex-col pb-8 flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              Investimentos
            </h1>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowModalAtivo(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <FaPlus className="text-lg" />
                <span>Cadastrar ativo</span>
              </button>
              <button
                onClick={() => handleOpenInvestimento(null)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <FaPiggyBank className="text-lg" />
                <span>Cadastrar investimento</span>
              </button>
            </div>
          </div>

          {successMessage && (
            <div className="bg-emerald-600/80 text-white p-3 rounded-lg mb-4">
              {successMessage}
            </div>
          )}

          {/* Cards: Patrimônio investido, Lucro/Prejuízo, Total investido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-800/30 backdrop-blur-md rounded-xl border border-indigo-500/20 p-6">
              <p className="text-gray-400 text-sm mb-1">Patrimônio investido</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(patrimonioTotal)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Valor atual dos investimentos (com lucro ou prejuízo)
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-800/30 backdrop-blur-md rounded-xl border border-indigo-500/20 p-6">
              <p className="text-gray-400 text-sm mb-1">Lucro / Prejuízo</p>
              <p
                className={`text-2xl font-bold ${lucroPrejuizo >= 0 ? "text-emerald-400" : "text-red-400"}`}
              >
                {formatCurrency(lucroPrejuizo)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Valor de mercado − Patrimônio investido (calculado
                automaticamente)
              </p>
              <p
                className={`text-sm mt-1 ${lucroPrejuizo >= 0 ? "text-emerald-300" : "text-red-300"}`}
              >
                {percentualVariacao >= 0 ? "+" : ""}
                {percentualVariacao.toFixed(2)}% sobre o total investido
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-800/30 backdrop-blur-md rounded-xl border border-indigo-500/20 p-6">
              <p className="text-gray-400 text-sm mb-1">Total investido</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(valorInvestidoTotal)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Soma do que você colocou em cada ativo
              </p>
            </div>
          </div>

          {/* Reserva de emergência */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <BsFillShieldLockFill className="text-indigo-400 text-xl" />
              <h2 className="text-xl font-bold">Reserva de emergência</h2>
            </div>
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-800/30 backdrop-blur-md rounded-xl border border-indigo-500/20 p-6 space-y-4">
              <div className="flex flex-wrap gap-4 items-center justify-center">
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Gasto mensal (R$)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={gastoLocked ? gastoMensalManual : gastoEdit}
                      onChange={(e) => {
                        if (gastoLocked) return;
                        const v = e.target.value.replace(/\D/g, "");
                        if (v === "") setGastoEdit("");
                        else {
                          const n = parseInt(v, 10) / 100;
                          setGastoEdit(
                            n.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }),
                          );
                        }
                      }}
                      disabled={gastoLocked}
                      className="flex-1 p-2 rounded-lg bg-gray-700/50 text-white border border-gray-600/50 disabled:opacity-70 disabled:cursor-not-allowed"
                      placeholder={
                        gastosMediosMensais > 0
                          ? `Auto: ${formatCurrency(gastosMediosMensais)}`
                          : "0,00"
                      }
                    />
                    {gastoLocked ? (
                      <button
                        type="button"
                        onClick={handleEditarGasto}
                        className="px-4 py-2 rounded-lg bg-amber-600/80 hover:bg-amber-600 text-white text-sm whitespace-nowrap"
                      >
                        Editar
                      </button>
                    ) : (
                      gastoEditDirty && (
                        <button
                          type="button"
                          onClick={handleSalvarGasto}
                          className="px-4 py-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-sm whitespace-nowrap"
                        >
                          Salvar
                        </button>
                      )
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {gastoLocked
                      ? "Valor salvo. Clique em Editar para alterar."
                      : "Deixe vazio para usar a média dos gastos das transações"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-300 whitespace-nowrap">
                    Meta da reserva
                  </span>
                  <select
                    value={mesesReserva}
                    onChange={(e) => setMesesReserva(e.target.value)}
                    className="p-2 rounded-lg bg-gray-700/50 text-white border border-gray-600/50"
                  >
                    <option value="6">6 meses</option>
                    <option value="12">12 meses</option>
                  </select>
                </div>
              </div>
              {(() => {
                const gastoEfetivo =
                  parseGastoNum(gastoMensalManual) > 0
                    ? parseGastoNum(gastoMensalManual)
                    : gastosMediosMensais;
                const meses = parseInt(mesesReserva, 10) || 6;
                const meta = gastoEfetivo * meses;
                const temMeta = meta > 0;
                const pct = temMeta ? (patrimonioEmergencia / meta) * 100 : 0;
                return (
                  <>
                    <p className="text-gray-400 text-sm">
                      Contabiliza apenas ativos marcados como &quot;Reserva de
                      emergência&quot; ao cadastrar investimento.
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-white">
                          {formatCurrency(patrimonioEmergencia)}
                          <span className="text-gray-500 font-normal text-base ml-1">
                            / {formatCurrency(meta)}
                          </span>
                        </p>
                        <p className="text-sm text-gray-400">
                          {temMeta
                            ? `Gasto mensal considerado: ${formatCurrency(gastoEfetivo)} × ${meses} meses`
                            : "Informe o gasto mensal ou cadastre transações de gastos"}
                        </p>
                      </div>
                      {temMeta && (
                        <div className="flex-1 sm:max-w-xs">
                          <div className="relative">
                            <div className="h-4 bg-gray-700 rounded-full overflow-visible">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  pct >= 100 ? "bg-emerald-500" : "bg-amber-500"
                                }`}
                                style={{ width: `${Math.min(100, pct)}%` }}
                              />
                            </div>
                            {pct >= 100 && (
                              <div className="absolute inset-0 pointer-events-none overflow-visible">
                                {[
                                  { x: "-6px", y: "-28px", delay: "0s", color: "bg-amber-400" },
                                  { x: "4px", y: "-32px", delay: "0.2s", color: "bg-emerald-400" },
                                  { x: "-12px", y: "-24px", delay: "0.4s", color: "bg-yellow-300" },
                                  { x: "8px", y: "-26px", delay: "0.1s", color: "bg-amber-300" },
                                  { x: "-2px", y: "-30px", delay: "0.3s", color: "bg-emerald-300" },
                                  { x: "6px", y: "-22px", delay: "0.5s", color: "bg-amber-500" },
                                  { x: "-8px", y: "-34px", delay: "0.15s", color: "bg-emerald-500" },
                                  { x: "2px", y: "-20px", delay: "0.35s", color: "bg-yellow-400" },
                                  { x: "-4px", y: "-26px", delay: "0.45s", color: "bg-amber-400" },
                                  { x: "10px", y: "-30px", delay: "0.25s", color: "bg-emerald-400" },
                                ].map((p, i) => (
                                  <div
                                    key={i}
                                    className={`absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-sm ${p.color} animate-confetti-bar`}
                                    style={{
                                      "--cf-x": p.x,
                                      "--cf-y": p.y,
                                      animationDelay: p.delay,
                                    }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {pct.toFixed(0)}% da meta
                            {pct >= 100 && (
                              <span className="text-emerald-400 font-medium ml-1">· Meta alcançada!</span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                    {!temMeta && (
                      <p className="text-amber-400/80 text-sm">
                        Informe seu gasto mensal acima ou adicione transações do
                        tipo &quot;Gasto&quot; na página de Transações.
                      </p>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* Ativos cadastrados */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Ativos cadastrados</h2>
            {ativos.length === 0 ? (
              <div className="bg-gray-800/40 rounded-xl border border-indigo-500/20 p-8 text-center text-gray-500">
                Nenhum ativo cadastrado. Clique em &quot;Cadastrar ativo&quot;
                para começar.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ativosPaginados.map((ativo) => (
                    <div
                      key={ativo.id}
                      className="bg-gray-800/40 rounded-xl border border-indigo-500/20 p-4 hover:border-indigo-500/40 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-white">
                            {ativo.nome}
                          </p>
                          <span className="text-xs text-gray-400">
                            {TIPOS_LABEL[ativo.tipo]}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleOpenInvestimento(ativo)}
                            className="p-2 rounded-lg bg-emerald-700/50 hover:bg-emerald-600/50 text-emerald-400"
                            title="Cadastrar investimento"
                          >
                            <FaPiggyBank className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleEditarAtivo(ativo)}
                            className="p-2 rounded-lg bg-amber-700/50 hover:bg-amber-600/50 text-amber-400"
                            title="Editar ativo"
                          >
                            <FaCog className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleOpenExcluir(ativo)}
                            className="p-2 rounded-lg bg-gray-700/50 hover:bg-red-600/50 text-red-400"
                            title="Excluir"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Tipo</span>
                          <span className="text-gray-300">
                            {TIPOS_LABEL[ativo.tipo] || ativo.tipo}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenInvestimento(ativo)}
                        className="mt-3 w-full py-2 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-400 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        <FaPiggyBank className="text-xs" />
                        Cadastrar investimento
                      </button>
                    </div>
                  ))}
                </div>
                {totalPaginasAtivos > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-400">
                      Página {pageAtivos} de {totalPaginasAtivos} (
                      {ativos.length} ativos)
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPageAtivos((p) => Math.max(1, p - 1))}
                        disabled={pageAtivos <= 1}
                        className="p-2 rounded-lg bg-gray-700/50 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                      >
                        <FaChevronLeft />
                      </button>
                      <button
                        onClick={() =>
                          setPageAtivos((p) =>
                            Math.min(totalPaginasAtivos, p + 1),
                          )
                        }
                        disabled={pageAtivos >= totalPaginasAtivos}
                        className="p-2 rounded-lg bg-gray-700/50 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                      >
                        <FaChevronRight />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <GraficoTipoAtivo ativos={ativosParaGrafico} />
            <GraficoEvolucaoMensal
              patrimonioHistorico={patrimonioHistoricoFiltrado}
              periodoInicio={periodoInicio}
              periodoFim={periodoFim}
            />
          </div>

          {/* Alocação ideal */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FaBalanceScale className="text-indigo-400" />
              <h2 className="text-xl font-bold">Alocação ideal (~17% cada)</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(ALOCACAO_IDEAL).map(([tipo, alvo]) => {
                const atual = alocacaoPercentuais[tipo] || 0;
                const diff = atual - alvo * 100;
                return (
                  <div
                    key={tipo}
                    className="bg-gray-800/40 rounded-xl border border-indigo-500/20 p-4"
                  >
                    <p className="text-gray-400 text-sm">{TIPOS_LABEL[tipo]}</p>
                    <div className="flex justify-between items-baseline mt-1">
                      <span className="text-white font-semibold">
                        {atual.toFixed(1)}%
                      </span>
                      <span className="text-gray-500 text-xs">
                        meta {(alvo * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, atual)}%` }}
                      />
                    </div>
                    {diff < -2 && (
                      <p className="text-amber-400 text-xs mt-1">
                        Investir mais:{" "}
                        {formatCurrency(
                          alvo * patrimonioTotal - (alocacaoAtual[tipo] || 0),
                        )}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Simulador */}
          <div className="mb-8">
            <SimuladorJurosCompostos patrimonioAtual={patrimonioTotal} />
          </div>

          {/* Histórico + filtro */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaHistory className="text-indigo-400" />
                Histórico de evolução patrimonial
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFiltro(!showFiltro)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 text-gray-300 hover:bg-gray-700"
                >
                  <FaFilter />
                  Filtrar período
                </button>
                <button
                  onClick={() => setShowRegistrarSnapshot(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600/80 text-white hover:bg-indigo-600"
                >
                  Registrar snapshot
                </button>
              </div>
            </div>

            {showFiltro && (
              <div className="flex flex-wrap gap-4 p-4 bg-gray-800/30 rounded-xl border border-indigo-500/20 mb-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">De</label>
                  <input
                    type="month"
                    value={periodoInicio}
                    onChange={(e) => setPeriodoInicio(e.target.value)}
                    className="p-2 rounded-lg bg-gray-700/50 text-white border border-gray-600/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Até
                  </label>
                  <input
                    type="month"
                    value={periodoFim}
                    onChange={(e) => setPeriodoFim(e.target.value)}
                    className="p-2 rounded-lg bg-gray-700/50 text-white border border-gray-600/50"
                  />
                </div>
                <button
                  onClick={() => {
                    setPeriodoInicio("");
                    setPeriodoFim("");
                  }}
                  className="self-end px-3 py-2 rounded-lg bg-gray-600 text-gray-300 hover:bg-gray-500"
                >
                  Limpar
                </button>
              </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-indigo-500/20 bg-gray-800/40">
              {patrimonioHistoricoFiltrado.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Nenhum registro no período. Clique em &quot;Registrar
                  snapshot&quot; para salvar o patrimônio atual.
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-3 text-gray-400 font-medium">
                        Mês/Ano
                      </th>
                      <th className="text-right p-3 text-gray-400 font-medium">
                        Patrimônio
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...patrimonioHistoricoFiltrado]
                      .sort((a, b) => {
                        const vA =
                          (a.ano || 0) * 12 + MESES.indexOf(a.mes || "");
                        const vB =
                          (b.ano || 0) * 12 + MESES.indexOf(b.mes || "");
                        return vB - vA;
                      })
                      .map((h) => (
                        <tr
                          key={h.id}
                          className="border-b border-gray-700/50 hover:bg-gray-700/30"
                        >
                          <td className="p-3">
                            {h.mes} / {h.ano}
                          </td>
                          <td className="p-3 text-right font-semibold text-emerald-400">
                            {formatCurrency(h.total_patrimonio)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Seus investimentos */}
          <div>
            <h2 className="text-xl font-bold mb-4">Seus investimentos</h2>
            {ativosComInvestimento.length === 0 ? (
              <div className="bg-gray-800/40 rounded-xl border border-indigo-500/20 p-8 text-center text-gray-500">
                Nenhum investimento cadastrado. Selecione um ativo e clique em
                &quot;Cadastrar investimento&quot; para começar.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {investimentosPaginados.map((ativo) => {
                    const valorInvestido = Number(ativo.valor_investido || 0);
                    const valorAtual = Number(ativo.valor_atual || 0);
                    const lucro = valorAtual - valorInvestido;
                    const pct =
                      valorInvestido > 0 ? (lucro / valorInvestido) * 100 : 0;
                    const estaValorizado = lucro > 0;
                    const estaDesvalorizado = lucro < 0;

                    return (
                      <div
                        key={ativo.id}
                        className="bg-gray-800/40 rounded-xl border border-indigo-500/20 p-4 hover:border-indigo-500/40 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-white">
                                {ativo.nome}
                              </p>
                              {ativo.emergencia && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-amber-600/50 text-amber-300">
                                  Emergência
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-400">
                              {TIPOS_LABEL[ativo.tipo]}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleOpenInvestimento(ativo)}
                              className="p-2 rounded-lg bg-emerald-700/50 hover:bg-emerald-600/50 text-emerald-400"
                              title="Cadastrar investimento"
                            >
                              <FaPiggyBank className="text-sm" />
                            </button>
                            <button
                              onClick={() => handleEditarValorMercado(ativo)}
                              className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600 text-indigo-400"
                              title="Editar valor na corretora"
                            >
                              <FaEdit className="text-sm" />
                            </button>
                            <button
                              onClick={() =>
                                handleOpenRemoverInvestimentos(ativo)
                              }
                              className="p-2 rounded-lg bg-amber-700/50 hover:bg-amber-600/50 text-amber-400"
                              title="Remover investimentos"
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 space-y-1 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Status</span>
                            <span
                              className={
                                estaValorizado
                                  ? "text-emerald-400 font-medium"
                                  : estaDesvalorizado
                                    ? "text-red-400 font-medium"
                                    : "text-gray-300 font-medium"
                              }
                            >
                              {estaValorizado
                                ? "Valorizado"
                                : estaDesvalorizado
                                  ? "Desvalorizado"
                                  : "Neutro"}{" "}
                              {pct !== 0 &&
                                `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`}
                            </span>
                          </div>
                          {patrimonioTotal > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">
                                % do patrimônio
                              </span>
                              <span className="text-indigo-300">
                                {((valorAtual / patrimonioTotal) * 100).toFixed(
                                  1,
                                )}
                                %
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-400">
                              Valor na carteira
                            </span>
                            <span className="text-white font-medium">
                              {formatCurrency(valorAtual)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">
                              Total investido
                            </span>
                            <span className="text-gray-300">
                              {formatCurrency(valorInvestido)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">
                              Lucro/Prejuízo
                            </span>
                            <span
                              className={
                                lucro >= 0 ? "text-emerald-400" : "text-red-400"
                              }
                            >
                              {lucro >= 0 ? "+" : ""}
                              {formatCurrency(lucro)} ({pct >= 0 ? "+" : ""}
                              {pct.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleOpenInvestimento(ativo)}
                          className="mt-3 w-full py-2 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-400 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                          <FaPiggyBank className="text-xs" />
                          Cadastrar investimento
                        </button>
                      </div>
                    );
                  })}
                </div>
                {totalPaginasInvestimentos > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-400">
                      Página {pageInvestimentos} de {totalPaginasInvestimentos}{" "}
                      ({ativosComInvestimento.length} investimentos)
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setPageInvestimentos((p) => Math.max(1, p - 1))
                        }
                        disabled={pageInvestimentos <= 1}
                        className="p-2 rounded-lg bg-gray-700/50 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                      >
                        <FaChevronLeft />
                      </button>
                      <button
                        onClick={() =>
                          setPageInvestimentos((p) =>
                            Math.min(totalPaginasInvestimentos, p + 1),
                          )
                        }
                        disabled={
                          pageInvestimentos >= totalPaginasInvestimentos
                        }
                        className="p-2 rounded-lg bg-gray-700/50 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                      >
                        <FaChevronRight />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showModalAtivo && (
        <ModalAtivo
          onClose={() => setShowModalAtivo(false)}
          onSave={handleSaveAtivo}
        />
      )}

      {showModalInvestimento && (
        <ModalInvestimento
          ativos={ativos}
          ativoPreSelecionado={ativoPreSelecionadoInvestimento}
          onClose={() => {
            setShowModalInvestimento(false);
            setAtivoPreSelecionadoInvestimento(null);
          }}
          onSave={handleSaveInvestimento}
        />
      )}

      {showModalEditarValor && ativoParaEditarValor && (
        <ModalEditarValorMercado
          ativo={ativoParaEditarValor}
          onClose={() => {
            setShowModalEditarValor(false);
            setAtivoParaEditarValor(null);
          }}
          onSave={handleSaveValorMercado}
        />
      )}

      {showModalEditarAtivo && ativoParaEditar && (
        <ModalEditarAtivo
          ativo={ativoParaEditar}
          onClose={() => {
            setShowModalEditarAtivo(false);
            setAtivoParaEditar(null);
          }}
          onSave={handleSaveEditarAtivo}
        />
      )}

      {showModalRemoverInvestimentos && ativoParaRemoverInvestimentos && (
        <ModalRemoverInvestimentos
          ativo={ativoParaRemoverInvestimentos}
          onClose={() => {
            setShowModalRemoverInvestimentos(false);
            setAtivoParaRemoverInvestimentos(null);
          }}
          onConfirm={handleRemoverInvestimentos}
        />
      )}

      {showModalExcluir && ativoParaExcluir && (
        <ModalExcluirAtivo
          ativo={ativoParaExcluir}
          onClose={() => {
            setShowModalExcluir(false);
            setAtivoParaExcluir(null);
          }}
          onConfirm={handleConfirmDeleteAtivo}
        />
      )}

      {showRegistrarSnapshot && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-2">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Registrar snapshot</h2>
              <button
                onClick={() => setShowRegistrarSnapshot(false)}
                className="text-gray-400 hover:text-white"
              >
                <IoClose className="text-2xl" />
              </button>
            </div>
            <p className="text-gray-300 mb-4">
              Salvar o patrimônio atual ({formatCurrency(patrimonioTotal)}) como
              snapshot do mês?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRegistrarSnapshot(false)}
                className="px-4 py-2 rounded-lg bg-gray-600 text-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleRegistrarSnapshot}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white"
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
