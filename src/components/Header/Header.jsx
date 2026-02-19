import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { FaBars } from "react-icons/fa";

export default function Header({ onMenuClick }) {
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

  const handleMenuClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onMenuClick) {
      onMenuClick();
    }
  };

  return (
    <header className="text-white h-16 p-4 flex justify-between items-center bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-950 border-b border-indigo-800/50 shadow-lg backdrop-blur-sm sticky top-0 z-50">
      {/* Botão Menu Mobile */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={handleMenuClick}
          className="p-3 rounded-lg bg-indigo-700 hover:bg-indigo-600 transition-colors border border-indigo-500 active:scale-95 touch-manipulation"
        >
          <FaBars className="text-xl text-white pointer-events-none" />
        </button>
      </div>

      {/* Espaçador invisível no desktop para manter alinhamento */}
      <div className="hidden md:block" />

      {/* Info do usuário */}
      {user ? (
        <div className="flex items-center space-x-2 sm:space-x-4 px-2 sm:px-4 py-2 rounded-xl bg-indigo-800/30 border border-indigo-700/30">
          <img
            src={userPhoto}
            alt="Foto de Perfil"
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-indigo-400/50 shadow-lg"
          />
          <p className="text-xs sm:text-sm font-semibold text-indigo-100 max-w-[100px] sm:max-w-none truncate">{userName}</p>
        </div>
      ) : (
        <div className="px-2 sm:px-4 py-2 rounded-xl bg-indigo-800/30 border border-indigo-700/30">
          <p className="text-xs sm:text-sm font-semibold text-indigo-200 animate-pulse">
            Carregando...
          </p>
        </div>
      )}
    </header>
  );
}
