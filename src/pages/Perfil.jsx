import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import { MdEmail, MdCalendarToday, MdLogin } from "react-icons/md";
import { IoExit, IoPersonCircle } from "react-icons/io5";
import { FaUser, FaTrophy, FaHistory } from "react-icons/fa";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateShort = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (v) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(v || 0);

const MILESTONES_PATRIMONIO = [1000, 5000, 10000, 50000, 100000, 500000];

const CONQUISTAS = [
  {
    id: "primeiro_investimento",
    emoji: "🥇",
    label: "Primeiro investimento",
    check: (data) => data.primeiroInvestimento,
  },
  {
    id: "tres_meses_poupando",
    emoji: "💰",
    label: "3 meses poupando",
    check: (data) => data.tresMesesPoupando,
  },
  {
    id: "patrimonio_1k",
    emoji: "📈",
    label: "Patrimônio acima de R$ 1.000",
    check: (data) => data.patrimonioMilestones >= 1000,
  },
  {
    id: "patrimonio_5k",
    emoji: "📈",
    label: "Patrimônio acima de R$ 5.000",
    check: (data) => data.patrimonioMilestones >= 5000,
  },
  {
    id: "patrimonio_10k",
    emoji: "📈",
    label: "Patrimônio acima de R$ 10.000",
    check: (data) => data.patrimonioMilestones >= 10000,
  },
  {
    id: "patrimonio_50k",
    emoji: "📈",
    label: "Patrimônio acima de R$ 50.000",
    check: (data) => data.patrimonioMilestones >= 50000,
  },
  {
    id: "patrimonio_100k",
    emoji: "📈",
    label: "Patrimônio acima de R$ 100.000",
    check: (data) => data.patrimonioMilestones >= 100000,
  },
  {
    id: "meta_concluida",
    emoji: "🎯",
    label: "Meta concluída",
    check: (data) => data.metaConcluida,
  },
];

export default function Perfil() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [ativos, setAtivos] = useState([]);
  const [metas, setMetas] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const showSidebar =
    location.pathname === "/dashboard" ||
    location.pathname === "/transacoes" ||
    location.pathname === "/metas" ||
    location.pathname === "/dividas" ||
    location.pathname === "/investimento" ||
    location.pathname === "/perfil";

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user: u },
      } = await supabase.auth.getUser();
      if (!u) {
        navigate("/");
        return;
      }
      setUser(u);
      setLoading(false);
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user?.id) return;

    const loadProfileData = async () => {
      const [ativosRes, metasRes, txRes] = await Promise.all([
        supabase
          .from("ativos")
          .select("id, nome, created_at, updated_at, valor_investido, valor_atual")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("metas")
          .select("id, created_at, updated_at, target_value, current_value, title")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("transactions")
          .select("date, type, value")
          .eq("user_id", user.id)
          .order("date", { ascending: true }),
      ]);

      if (!ativosRes.error) setAtivos(ativosRes.data || []);
      if (!metasRes.error) setMetas(metasRes.data || []);
      if (!txRes.error) setTransactions(txRes.data || []);
    };

    loadProfileData();
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  const achievementData = useMemo(() => {
    const patrimonioTotal = ativos.reduce(
      (s, a) => s + Number(a.valor_atual || 0),
      0
    );
    const primeiroInvestimento =
      ativos.some((a) => Number(a.valor_investido || 0) > 0);
    const metaConcluida = metas.some(
      (m) => Number(m.current_value || 0) >= Number(m.target_value || 0)
    );

    const porMes = {};
    (transactions || []).forEach((t) => {
      const [y, m] = (t.date || "").split("-");
      const key = `${y}-${m}`;
      if (!porMes[key]) porMes[key] = { receita: 0, despesa: 0 };
      const v = Math.abs(Number(t.value) || 0);
      if (t.type === "Ganho") porMes[key].receita += v;
      else if (t.type === "Gasto") porMes[key].despesa += v;
    });
    const nextMonthKey = (key) => {
      const [y, m] = key.split("-").map(Number);
      if (m === 12) return `${y + 1}-01`;
      return `${y}-${String(m + 1).padStart(2, "0")}`;
    };
    const mesesPositivos = new Set(
      Object.keys(porMes).filter(
        (k) => porMes[k].receita - porMes[k].despesa > 0
      )
    );
    let maxConsecutivos = 0;
    for (const start of mesesPositivos) {
      let run = 0;
      let curr = start;
      while (mesesPositivos.has(curr)) {
        run++;
        curr = nextMonthKey(curr);
      }
      maxConsecutivos = Math.max(maxConsecutivos, run);
    }
    const tresMesesPoupando = maxConsecutivos >= 3;

    const patrimonioMilestones = MILESTONES_PATRIMONIO.filter(
      (m) => patrimonioTotal >= m
    ).pop();
    return {
      primeiroInvestimento,
      tresMesesPoupando,
      patrimonioMilestones: patrimonioMilestones || 0,
      metaConcluida,
      patrimonioTotal,
    };
  }, [ativos, metas, transactions]);

  const conquistasDesbloqueadas = useMemo(
    () => CONQUISTAS.filter((c) => c.check(achievementData)),
    [achievementData]
  );

  const timelineEventos = useMemo(() => {
    const eventos = [];
    if (user?.created_at) {
      eventos.push({
        type: "cadastro",
        label: "Primeiro cadastro",
        date: user.created_at,
        icon: "📝",
      });
    }
    const primeiroAtivo = ativos.find((a) => Number(a.valor_investido || 0) > 0);
    if (primeiroAtivo?.created_at) {
      eventos.push({
        type: "investimento",
        label: "Primeiro investimento",
        date: primeiroAtivo.created_at,
        extra: primeiroAtivo.nome,
        icon: "🥇",
      });
    }
    const primeiraMeta = metas[0];
    if (primeiraMeta?.created_at) {
      eventos.push({
        type: "meta_criada",
        label: "Primeira meta criada",
        date: primeiraMeta.created_at,
        extra: primeiraMeta.title,
        icon: "🎯",
      });
    }
    const metasConcluidas = metas.filter(
      (m) => Number(m.current_value || 0) >= Number(m.target_value || 0)
    );
    const metaConcluida = metasConcluidas.sort(
      (a, b) => new Date(a.updated_at) - new Date(b.updated_at)
    )[0];
    if (metaConcluida) {
      const dataConclusao = metaConcluida.updated_at || metaConcluida.created_at;
      if (dataConclusao) {
        eventos.push({
          type: "meta_concluida",
          label: "Primeira meta concluída",
          date: dataConclusao,
        extra: metaConcluida.title,
          icon: "✅",
        });
      }
    }
    const lucros = ativos.map((a) => ({
      ativo: a,
      lucro: Number(a.valor_atual || 0) - Number(a.valor_investido || 0),
    }));
    const maiorLucro = lucros
      .filter((l) => l.lucro > 0)
      .sort((a, b) => b.lucro - a.lucro)[0];
    if (maiorLucro && maiorLucro.lucro > 0) {
      eventos.push({
        type: "maior_lucro",
        label: "Maior lucro já registrado",
        date: maiorLucro.ativo.updated_at || maiorLucro.ativo.created_at,
        extra: formatCurrency(maiorLucro.lucro),
        icon: "📈",
      });
    }
    return eventos.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [user?.created_at, ativos, metas]);

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Usuário";
  const userPhoto =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=6366f1&color=fff`;

  if (loading) {
    return (
      <div className="text-white flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
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
        <div className="p-4 md:ml-28 ml-0 flex flex-col pb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-8">Meu Perfil</h1>

          <div className="flex flex-col lg:flex-row gap-6 max-w-4xl">
            {/* Card do avatar e info principal */}
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-800/30 backdrop-blur-md rounded-xl border border-indigo-500/20 p-6 flex flex-col items-center gap-4 flex-1">
              <div className="relative">
                <img
                  src={userPhoto}
                  alt="Foto de perfil"
                  className="h-32 w-32 rounded-full border-4 border-indigo-500/50 shadow-xl"
                />
                <div className="absolute -bottom-1 -right-1 bg-indigo-600 rounded-full p-2">
                  <IoPersonCircle className="text-2xl text-white" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-indigo-100">{userName}</h2>
              {user?.email && (
                <a
                  href={`mailto:${user.email}`}
                  className="text-indigo-300 hover:text-indigo-200 text-sm flex items-center gap-2 transition-colors"
                >
                  <MdEmail className="text-lg" />
                  {user.email}
                </a>
              )}
            </div>

            {/* Card de detalhes */}
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-800/30 backdrop-blur-md rounded-xl border border-indigo-500/20 p-6 flex-1 space-y-4">
              <h3 className="text-lg font-semibold text-indigo-200 mb-4 flex items-center gap-2">
                <FaUser className="text-indigo-400" />
                Informações da conta
              </h3>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/30 border border-indigo-500/10">
                <MdCalendarToday className="text-indigo-400 text-xl mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-400 text-sm">Membro desde</p>
                  <p className="text-white font-medium">
                    {formatDate(user?.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/30 border border-indigo-500/10">
                <MdLogin className="text-indigo-400 text-xl mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-400 text-sm">Último acesso</p>
                  <p className="text-white font-medium">
                    {formatDate(user?.last_sign_in_at)}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-indigo-500/20">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 hover:border-red-500/50 text-red-300 hover:text-red-200 transition-all"
                >
                  <IoExit className="text-xl" />
                  Sair da conta
                </button>
              </div>
            </div>
          </div>

          {/* Sistema de Conquistas */}
          <div className="mt-8 max-w-4xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-100">
              <FaTrophy className="text-amber-400" />
              Conquistas
            </h2>
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-800/30 backdrop-blur-md rounded-xl border border-indigo-500/20 p-6">
              <div className="flex flex-wrap gap-3">
                {CONQUISTAS.map((c) => {
                  const desbloqueada = c.check(achievementData);
                  return (
                    <div
                      key={c.id}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                        desbloqueada
                          ? "bg-amber-500/20 border-amber-500/40 text-amber-100"
                          : "bg-gray-800/50 border-gray-700/50 text-gray-500"
                      }`}
                    >
                      <span className="text-xl">{c.emoji}</span>
                      <span className="text-sm font-medium">{c.label}</span>
                      {!desbloqueada && (
                        <span className="text-gray-600">🔒</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-gray-400 text-sm mt-4">
                {conquistasDesbloqueadas.length} de {CONQUISTAS.length}{" "}
                conquistas desbloqueadas
              </p>
            </div>
          </div>

          {/* Linha do Tempo Financeira */}
          <div className="mt-8 max-w-4xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-100">
              <FaHistory className="text-indigo-400" />
              Linha do Tempo Financeira
            </h2>
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-800/30 backdrop-blur-md rounded-xl border border-indigo-500/20 p-6">
              {timelineEventos.length === 0 ? (
                <p className="text-gray-400 text-center py-4">
                  Nenhum marco registrado ainda. Comece a usar o app para ver sua
                  linha do tempo!
                </p>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-indigo-500/30 rounded-full" />
                  <div className="space-y-6">
                    {timelineEventos.map((ev, i) => (
                      <div key={i} className="flex gap-4 items-start relative">
                        <div className="relative z-10 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm shrink-0">
                          {ev.icon}
                        </div>
                        <div className="flex-1 pb-2">
                          <p className="font-medium text-indigo-100">
                            {ev.label}
                          </p>
                          {ev.extra && (
                            <p className="text-sm text-gray-400">{ev.extra}</p>
                          )}
                          <p className="text-xs text-indigo-300/80 mt-1">
                            {formatDateShort(ev.date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
