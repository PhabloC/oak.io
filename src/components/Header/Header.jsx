import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (mounted) {
        setUser(user);
      }
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Extrai nome e foto do user_metadata do Supabase
  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Usuário";
  const userPhoto =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      userName
    )}&background=6366f1&color=fff`;

  return (
    <header className="text-white h-16 p-4 flex justify-end items-center bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-950 border-b border-indigo-800/50 shadow-lg backdrop-blur-sm">
      {user ? (
        <div className="flex items-center space-x-4 px-4 py-2 rounded-xl bg-indigo-800/30 border border-indigo-700/30 hover:bg-indigo-800/50 transition-all duration-200 hover:scale-[1.02]">
          <img
            src={userPhoto}
            alt="Foto de Perfil"
            className="h-10 w-10 rounded-full border-2 border-indigo-400/50 shadow-lg"
          />
          <p className="text-sm font-semibold text-indigo-100">{userName}</p>
        </div>
      ) : (
        <div className="px-4 py-2 rounded-xl bg-indigo-800/30 border border-indigo-700/30">
          <p className="text-sm font-semibold text-indigo-200 animate-pulse">
            Carregando...
          </p>
        </div>
      )}
    </header>
  );
}
