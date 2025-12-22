import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const checkUser = async () => {
      try {
        // Verifica se está processando callback OAuth
        const hasOAuthHash =
          window.location.hash &&
          (window.location.hash.includes("access_token") ||
            window.location.hash.includes("error"));

        let session = null;
        let error = null;

        if (hasOAuthHash) {
          let attempts = 0;
          const maxAttempts = 5;
          while (attempts < maxAttempts && !session) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            const result = await supabase.auth.getSession();
            session = result.data?.session;
            error = result.error;
            if (session?.user) {
              break;
            }
            attempts++;
          }
        }

        // Se não encontrou sessão ainda, busca novamente
        if (!session) {
          const result = await supabase.auth.getSession();
          session = result.data?.session;
          error = result.error;
        }

        if (error) {
          console.error(" Erro ao buscar sessão:", error);
          if (mounted) {
            setLoading(false);
            setUser(null);
            navigate("/");
          }
          return;
        }

        if (!mounted) return;

        if (session?.user) {
          if (window.location.hash) {
            window.history.replaceState(null, "", window.location.pathname);
          }
          setUser(session.user);
          setLoading(false);
        } else {
          setUser(null);
          setLoading(false);
          // Só redireciona se não estiver processando OAuth
          if (!hasOAuthHash) {
            navigate("/");
          }
        }
      } catch (error) {
        console.error(" Erro no checkUser:", error);
        if (mounted) {
          setLoading(false);
          setUser(null);
          navigate("/");
        }
      }
    };

    checkUser();

    // Listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_IN" && session?.user) {
        // Limpa o hash após login bem-sucedido
        if (window.location.hash) {
          window.history.replaceState(null, "", window.location.pathname);
        }
        setUser(session.user);
        setLoading(false);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        navigate("/");
      } else if (event === "TOKEN_REFRESHED") {
        if (session?.user) {
          setUser(session.user);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  return user ? children : null;
}
