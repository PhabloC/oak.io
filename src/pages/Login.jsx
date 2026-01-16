import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Banner from "../assets/banner.jpg";
import Logo from "../assets/Header/logo2.png";
import Google from "../assets/google.png";

export default function Login() {
  const navigate = useNavigate();
  const [showGoogleSpin, setShowGoogleSpin] = useState(false);
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);
  const googleImgRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    let authCheckTimeout = null;
    const isProcessingRef = { current: false };

    const checkUser = async () => {
      try {
        // Verifica se está processando callback OAuth
        const hasOAuthHash =
          window.location.hash &&
          (window.location.hash.includes("access_token") ||
            window.location.hash.includes("error"));

        if (hasOAuthHash) {
          setIsProcessingAuth(true);
          isProcessingRef.current = true;

          // IMPORTANTE: Processa explicitamente o hash
          try {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
              console.error(" Erro ao processar sessão:", error);
            } else if (data?.session) {
              // O onAuthStateChange vai capturar isso e redirecionar
            }
          } catch (err) {
            console.error(" Erro ao processar callback:", err);
          }

          // Define um timeout de segurança
          authCheckTimeout = setTimeout(() => {
            if (mounted && isProcessingRef.current) {
              setIsProcessingAuth(false);
              isProcessingRef.current = false;
              alert(
                "Houve um problema ao processar o login. Por favor, tente novamente."
              );
            }
          }, 5000);

          return;
        }

        // Se não há hash OAuth, verifica a sessão normalmente
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error(" Login: Erro ao buscar sessão:", error);
          setIsProcessingAuth(false);
          return;
        }

        if (!mounted) return;

        if (session?.user) {
          navigate("/dashboard", { replace: true });
        } else {
          setIsProcessingAuth(false);
        }
      } catch (error) {
        console.error(" Login: Erro no checkUser:", error);
        setIsProcessingAuth(false);
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      // Cancela o timeout se houver
      if (authCheckTimeout) {
        clearTimeout(authCheckTimeout);
        authCheckTimeout = null;
      }

      if (event === "SIGNED_IN" && session?.user) {
        isProcessingRef.current = false;
        // Limpa o hash da URL
        if (window.location.hash) {
          console.log(" Limpando hash da URL");
          window.history.replaceState(null, "", window.location.pathname);
        }
        // Redireciona para o dashboard
        setIsProcessingAuth(false);
        navigate("/dashboard", { replace: true });
      } else if (event === "SIGNED_OUT") {
        isProcessingRef.current = false;
        setIsProcessingAuth(false);
      } else if (event === "INITIAL_SESSION") {
        if (session?.user) {
          isProcessingRef.current = false;
          setIsProcessingAuth(false);
          navigate("/dashboard", { replace: true });
        } else {
          isProcessingRef.current = false;
          setIsProcessingAuth(false);
        }
      }
    });

    return () => {
      mounted = false;
      if (authCheckTimeout) {
        clearTimeout(authCheckTimeout);
      }
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Dispara animação do Google após animação do modal
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGoogleSpin(true);
      setTimeout(() => setShowGoogleSpin(false), 800);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setIsProcessingAuth(true);

      // Usa a URL atual completa para o redirecionamento
      // Remove qualquer hash ou query string existente para evitar conflitos
      const redirectTo =
        `${window.location.origin}${window.location.pathname}`.replace(
          /\/$/,
          ""
        ) || `${window.location.origin}/`;

      console.log(" URL de redirecionamento:", redirectTo);
      console.log(" URL atual:", window.location.href);
      console.log(" Origin:", window.location.origin);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error(" Erro ao fazer login:", error.message);
        console.error("Erro completo:", error);
        alert(`Erro ao fazer login: ${error.message}`);
        setIsProcessingAuth(false);
        return;
      }

      // Se não houver erro, o Supabase vai redirecionar automaticamente
      // Não precisamos fazer nada aqui, o onAuthStateChange vai capturar
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      alert(`Erro ao fazer login: ${error.message || error}`);
      setIsProcessingAuth(false);
    }
  };

  // Mostra loading se estiver processando autenticação OAuth
  if (isProcessingAuth) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center bg-cover bg-center relative"
        style={{
          backgroundImage: `url(${Banner})`,
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 bg-gray-800/30 backdrop-blur-md p-8 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="text-white mt-4 text-lg font-semibold">
              Processando autenticação...
            </p>
            <p className="text-gray-300 mt-2 text-sm">
              Aguarde enquanto validamos seu login
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage: `url(${Banner})`,
      }}
    >
      {/* Overlay escuro */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Conteúdo centralizado com efeito de vidro e animação */}
      <div
        className="relative z-10 bg-gray-800/30 backdrop-blur-md p-6 sm:p-8 rounded-lg shadow-lg w-[95vw] max-w-[500px] h-auto min-h-[420px] flex flex-col items-center justify-center animate-fade-in-up"
        style={{
          animation: "fadeInUp 0.7s cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        <style>
          {`
            @keyframes fadeInUp {
              0% {
                opacity: 0;
                transform: translateY(60px) scale(0.95);
              }
              100% {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }
            .animate-fade-in-up {
              animation: fadeInUp 0.7s cubic-bezier(0.23, 1, 0.32, 1);
            }
            .spin-once {
              animation: spinOnce 0.8s cubic-bezier(0.23, 1, 0.32, 1);
            }
            @keyframes spinOnce {
              0% { transform: rotate(0deg);}
              80% { transform: rotate(360deg);}
              100% { transform: rotate(360deg);}
            }
          `}
        </style>
        <div className="flex flex-col items-center gap-6 w-full">
          <img className="h-16 w-auto sm:h-20" src={Logo} alt="Logo" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-poppins text-center">
            Bem-vindo
          </h2>
          <p className="text-base sm:text-lg text-gray-400 text-center font-poppins w-full max-w-[350px]">
            Gerencie suas finanças com simplicidade e segurança. Bem-vindo à sua
            jornada de controle financeiro!
          </p>
          <button
            onClick={handleGoogleLogin}
            disabled={isProcessingAuth}
            className="flex items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 w-full max-w-[320px] justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img
              ref={googleImgRef}
              className={`w-6 h-6 inline-block mr-3 ${
                showGoogleSpin ? "spin-once" : ""
              }`}
              src={Google}
              alt="Google Logo"
            />
            <span className="font-semibold text-base sm:text-lg">
              {isProcessingAuth ? "Processando..." : "Login com Google"}
            </span>
          </button>
          {/* Mensagem de direitos reservados */}
          <div className="text-center mt-6 w-full">
            <p className="text-gray-500 text-xs sm:text-sm">
              © 2025 Todos os direitos reservados. Phablo Carvalho
            </p>
            <a
              href="https://github.com/PhabloC"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 text-xs sm:text-sm hover:underline break-all"
            >
              https://github.com/PhabloC
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
