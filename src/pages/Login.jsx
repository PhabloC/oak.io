import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Banner from "../assets/banner.jpg";
import Logo from "../assets/Header/logo2.png";
import Google from "../assets/google.png";

export default function Login() {
  const navigate = useNavigate();
  const [showGoogleSpin, setShowGoogleSpin] = useState(false);
  const googleImgRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (mounted && user) {
        navigate("/dashboard");
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    return () => {
      mounted = false;
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
      // O redirectTo deve apontar para onde o Supabase vai redirecionar após a autenticação
      // O Supabase processa o callback e então redireciona para esta URL
      const redirectTo = `${window.location.origin}/dashboard`;

      // Logs para debug
      console.log("🔍 Iniciando login com Google...");
      console.log("📍 URL de redirecionamento:", redirectTo);
      console.log("🌐 Supabase URL:", import.meta.env.VITE_SUPABASE_URL);

      // A URL de callback do Supabase será: https://[PROJETO-ID].supabase.co/auth/v1/callback
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (supabaseUrl) {
        const callbackUrl = `${supabaseUrl}/auth/v1/callback`;
        console.log(
          "🔗 URL de callback do Supabase (adicione no Google Cloud Console):",
          callbackUrl
        );
        console.log(
          "⚠️  IMPORTANTE: Esta URL deve estar configurada no Google Cloud Console!"
        );
      }

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
        console.error("❌ Erro ao fazer login:", error.message);
        console.error("Detalhes do erro:", error);
        alert(
          `Erro ao fazer login: ${error.message}\n\nVerifique o console para mais detalhes.`
        );
      } else if (data) {
        console.log("✅ Login iniciado com sucesso!");
        console.log("Redirecionando para:", data.url);
      }
    } catch (error) {
      console.error("❌ Erro ao fazer login:", error);
      alert(
        `Erro ao fazer login: ${
          error.message || error
        }\n\nVerifique o console para mais detalhes.`
      );
    }
  };

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
            className="flex items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 w-full max-w-[320px] justify-center"
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
              Login com Google
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
