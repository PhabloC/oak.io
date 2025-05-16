import { useEffect, useRef, useState } from "react";
import { auth, googleProvider } from "../firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Banner from "../assets/banner.jpg";
import Logo from "../assets/Header/logo2.png";
import Google from "../assets/google.png";

export default function Login() {
  const navigate = useNavigate();
  const [showGoogleSpin, setShowGoogleSpin] = useState(false);
  const googleImgRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate("/dashboard");
      }
    });
    return () => unsubscribe();
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
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Erro ao fazer login:", error.code, error.message);
    }
  };

  return (
    <div
      className="h-screen w-full flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage: `url(${Banner})`,
      }}
    >
      {/* Overlay escuro */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Conteúdo centralizado com efeito de vidro e animação */}
      <div
        className="relative z-10 bg-gray-800/30 backdrop-blur-md p-8 rounded-lg shadow-lg w-[500px] h-[500px] flex flex-col items-center justify-center
        animate-fade-in-up"
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
        <div className="flex flex-col items-center gap-6">
          <img className="h-20 w-45" src={Logo} alt="Logo" />
          <h2 className="text-3xl font-bold text-white font-poppins">
            Bem-vindo
          </h2>
          <p className="text-lg text-gray-400 text-center font-poppins w-[350px]">
            Gerencie suas finanças com simplicidade e segurança. Bem-vindo à sua
            jornada de controle financeiro!
          </p>
          <button
            onClick={handleGoogleLogin}
            className="flex items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            <img
              ref={googleImgRef}
              className={`w-6 h-6 inline-block mr-3 ${
                showGoogleSpin ? "spin-once" : ""
              }`}
              src={Google}
              alt="Google Logo"
            />
            <span className="font-semibold text-lg">Login com Google</span>
          </button>
          {/* Mensagem de direitos reservados */}
          <div className="text-center mt-6">
            <p className="text-gray-500 text-sm">
              © 2025 Todos os direitos reservados. Phablo Carvalho
            </p>
            <a
              href="https://github.com/PhabloC"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 text-sm hover:underline"
            >
              https://github.com/PhabloC
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
