import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import { supabase } from "../supabaseClient";
import AccountInfoCard from "../components/Perfil/AccountInfoCard";
import AchievementsSection from "../components/Perfil/AchievementsSection";
import PreferencesCard from "../components/Perfil/PreferencesCard";
import ProfileHero from "../components/Perfil/ProfileHero";
import TimelineSection from "../components/Perfil/TimelineSection";
import {
  formatCurrency,
  formatDateShort,
  formatDateTime,
  getMaxConsecutivePositiveMonths,
} from "../utils/profile";

const MILESTONES_PATRIMONIO = [1000, 5000, 10000, 50000, 100000, 500000];
const PREFERENCES_STORAGE_KEY = "oakio.profile.preferences";

const CONQUISTAS = [
  {
    id: "primeiro_investimento",
    emoji: "PI",
    label: "Primeiro investimento",
    check: (data) => data.primeiroInvestimento,
  },
  {
    id: "tres_meses_poupando",
    emoji: "3M",
    label: "3 meses poupando",
    check: (data) => data.tresMesesPoupando,
  },
  {
    id: "patrimonio_1k",
    emoji: "R$",
    label: "Patrimônio acima de R$ 1.000",
    check: (data) => data.patrimonioMilestones >= 1000,
  },
  {
    id: "patrimonio_5k",
    emoji: "R$",
    label: "Patrimônio acima de R$ 5.000",
    check: (data) => data.patrimonioMilestones >= 5000,
  },
  {
    id: "patrimonio_10k",
    emoji: "R$",
    label: "Patrimônio acima de R$ 10.000",
    check: (data) => data.patrimonioMilestones >= 10000,
  },
  {
    id: "patrimonio_50k",
    emoji: "R$",
    label: "Patrimônio acima de R$ 50.000",
    check: (data) => data.patrimonioMilestones >= 50000,
  },
  {
    id: "patrimonio_100k",
    emoji: "R$",
    label: "Patrimônio acima de R$ 100.000",
    check: (data) => data.patrimonioMilestones >= 100000,
  },
  {
    id: "meta_concluida",
    emoji: "OK",
    label: "Meta concluída",
    check: (data) => data.metaConcluida,
  },
];

const defaultPreferences = {
  compactAchievements: true,
  showDetailedTimeline: true,
};

export default function Perfil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [ativos, setAtivos] = useState([]);
  const [metas, setMetas] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [dataLoading, setDataLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [lastSyncAt, setLastSyncAt] = useState(null);

  const [savingProfile, setSavingProfile] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    avatarUrl: "",
  });

  const [preferences, setPreferences] = useState(defaultPreferences);

  useEffect(() => {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) return;

    try {
      setPreferences({ ...defaultPreferences, ...JSON.parse(raw) });
    } catch {
      setPreferences(defaultPreferences);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        navigate("/");
        return;
      }

      setUser(authUser);
      setAuthLoading(false);
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
    if (!user) return;

    setProfileForm({
      fullName:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "",
      avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || "",
    });
  }, [user]);

  const loadProfileData = useCallback(async () => {
    if (!user?.id) return;

    setDataLoading(true);
    setProfileError("");

    const [ativosRes, metasRes, txRes] = await Promise.all([
      supabase
        .from("ativos")
        .select("id, nome, created_at, updated_at, valor_investido, valor_atual")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("metas")
        .select("id, created_at, target_value, current_value, title")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("transactions")
        .select("id, date, type, value")
        .eq("user_id", user.id)
        .order("date", { ascending: true }),
    ]);

    if (!ativosRes.error) setAtivos(ativosRes.data || []);
    if (!metasRes.error) setMetas(metasRes.data || []);
    if (!txRes.error) setTransactions(txRes.data || []);

    const hasError = [ativosRes.error, metasRes.error, txRes.error].some(Boolean);
    if (hasError) {
      setProfileError("Não foi possível carregar todos os dados do perfil. Tente novamente.");
    }

    setLastSyncAt(new Date().toISOString());
    setDataLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const handleLogout = async () => {
    const shouldLogout = window.confirm("Deseja realmente sair da conta?");
    if (!shouldLogout) return;

    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setSaveMessage("");

    try {
      const fullName = profileForm.fullName.trim();
      const avatarUrl = profileForm.avatarUrl.trim();

      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName || null,
          avatar_url: avatarUrl || null,
        },
      });

      if (error) throw error;
      if (data?.user) setUser(data.user);

      setSaveMessage("Perfil atualizado com sucesso.");
    } catch {
      setSaveMessage("Não foi possível atualizar o perfil.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleProfileFormChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePreferenceChange = (field, value) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));
  };

  const achievementData = useMemo(() => {
    const patrimonioTotal = ativos.reduce((sum, ativo) => sum + Number(ativo.valor_atual || 0), 0);
    const primeiroInvestimento = ativos.some((ativo) => Number(ativo.valor_investido || 0) > 0);
    const metaConcluida = metas.some(
      (meta) => Number(meta.current_value || 0) >= Number(meta.target_value || 0)
    );

    const maxConsecutivePositiveMonths = getMaxConsecutivePositiveMonths(transactions);
    const patrimonioMilestones =
      MILESTONES_PATRIMONIO.filter((milestone) => patrimonioTotal >= milestone).pop() || 0;

    return {
      primeiroInvestimento,
      tresMesesPoupando: maxConsecutivePositiveMonths >= 3,
      patrimonioMilestones,
      metaConcluida,
      patrimonioTotal,
    };
  }, [ativos, metas, transactions]);

  const conquistas = useMemo(
    () =>
      CONQUISTAS.map((item) => ({
        ...item,
        unlocked: item.check(achievementData),
      })),
    [achievementData]
  );

  const timelineEventos = useMemo(() => {
    const eventos = [];

    if (user?.created_at) {
      eventos.push({
        id: "cadastro",
        label: "Primeiro cadastro",
        date: user.created_at,
        icon: "IN",
      });
    }

    const primeiroAtivo = ativos.find((ativo) => Number(ativo.valor_investido || 0) > 0);
    if (primeiroAtivo?.created_at) {
      eventos.push({
        id: "primeiro_investimento",
        label: "Primeiro investimento",
        date: primeiroAtivo.created_at,
        extra: primeiroAtivo.nome,
        icon: "AP",
      });
    }

    const primeiraMeta = metas[0];
    if (primeiraMeta?.created_at) {
      eventos.push({
        id: "primeira_meta",
        label: "Primeira meta criada",
        date: primeiraMeta.created_at,
        extra: primeiraMeta.title,
        icon: "MT",
      });
    }

    const metasConcluidas = metas
      .filter((meta) => Number(meta.current_value || 0) >= Number(meta.target_value || 0))
      .sort(
        (a, b) =>
          new Date(a.updated_at || a.created_at) - new Date(b.updated_at || b.created_at)
      );

    const primeiraMetaConcluida = metasConcluidas[0];
    if (primeiraMetaConcluida) {
      eventos.push({
        id: "meta_concluida",
        label: "Primeira meta concluída",
        date: primeiraMetaConcluida.updated_at || primeiraMetaConcluida.created_at,
        extra: primeiraMetaConcluida.title,
        icon: "MC",
      });
    }

    const maiorLucro = ativos
      .map((ativo) => ({
        ativo,
        lucro: Number(ativo.valor_atual || 0) - Number(ativo.valor_investido || 0),
      }))
      .filter((item) => item.lucro > 0)
      .sort((a, b) => b.lucro - a.lucro)[0];

    if (maiorLucro) {
      eventos.push({
        id: "maior_lucro",
        label: "Maior lucro registrado",
        date: maiorLucro.ativo.updated_at || maiorLucro.ativo.created_at,
        extra: formatCurrency(maiorLucro.lucro),
        icon: "R$",
      });
    }

    return eventos.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [user?.created_at, ativos, metas]);

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Usuário";

  const userPhoto =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0f172a&color=e2e8f0`;

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-400" />
      </div>
    );
  }

  const unlockedCount = conquistas.filter((item) => item.unlocked).length;

  return (
    <div className="flex min-h-screen text-white">
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-y-auto">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />

        <main className="mx-auto w-full max-w-7xl px-4 pb-10 pt-6 md:ml-28 md:px-6">
          <ProfileHero
            userName={userName}
            userEmail={user?.email || "Email não informado"}
            userPhoto={userPhoto}
            profileForm={profileForm}
            onProfileFormChange={handleProfileFormChange}
            onSaveProfile={handleSaveProfile}
            savingProfile={savingProfile}
            saveMessage={saveMessage}
            unlockedAchievements={unlockedCount}
            totalAchievements={conquistas.length}
            patrimonioTotal={formatCurrency(achievementData.patrimonioTotal)}
          />

          {profileError && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-red-400/40 bg-red-500/15 px-4 py-3 text-sm text-red-100">
              <span>{profileError}</span>
              <button
                type="button"
                onClick={loadProfileData}
                className="rounded-md border border-red-300/50 px-3 py-1 text-xs font-semibold hover:bg-red-500/20"
              >
                Tentar novamente
              </button>
            </div>
          )}

          <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_1fr]">
            <AccountInfoCard
              memberSince={formatDateTime(user?.created_at)}
              lastSignIn={formatDateTime(user?.last_sign_in_at)}
              lastSync={formatDateTime(lastSyncAt)}
              onLogout={handleLogout}
            />
            <PreferencesCard
              preferences={preferences}
              onPreferenceChange={handlePreferenceChange}
            />
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_1fr]">
            <AchievementsSection
              achievements={conquistas}
              compact={preferences.compactAchievements}
            />
            <TimelineSection
              events={timelineEventos}
              formatDate={formatDateShort}
              detailed={preferences.showDetailedTimeline}
            />
          </div>

          {dataLoading && (
            <p className="mt-4 text-sm text-cyan-200" role="status" aria-live="polite">
              Sincronizando dados do perfil...
            </p>
          )}
        </main>
      </div>
    </div>
  );
}

