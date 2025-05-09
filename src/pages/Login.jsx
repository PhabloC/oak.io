import { useEffect } from "react";
import { auth, googleProvider } from "../firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Banner from "../assets/banner.jpg";
import Logo from "../assets/Header/logo2.png";
import Google from "../assets/google.png";

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("Usuário logado:", user);
        navigate("/dashboard");
      } else {
        console.log("Nenhum usuário logado");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    console.log("Iniciando login com Google...");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Login bem-sucedido:", result.user);
    } catch (error) {
      console.error("Erro ao fazer login:", error.code, error.message);
    }
  };

  return (
    <div className="h-screen flex w-full">
      <div className="bg-[#1E1E2F] flex flex-1 flex-col justify-center gap-6 items-center ">
        <img className="h-20 w-45" src={Logo} alt="Logo" />
        <h2 className="text-3xl font-bold text-white font-poppins">
          Bem-vindo
        </h2>
        <p
          className="text-lg text-gray-400 text-center font-poppins
        w-[450px]"
        >
          Gerencie suas finanças com simplicidade e segurança. Bem-vindo à sua
          jornada de controle financeiro!
        </p>
        <button
          onClick={handleGoogleLogin}
          className="flex items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
        >
          <img
            className="w-6 h-6 inline-block mr-3"
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
      <div className="flex-1">
        <img className="h-full w-full object-cover" src={Banner} alt="Banner" />
      </div>
    </div>
  );
}
