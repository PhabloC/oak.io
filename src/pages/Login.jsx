import { auth, googleProvider } from "../firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Banner from "../assets/banner.jpg";
import Logo from "../assets/Header/logo2.png";

export default function Login() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard"); // Redireciona para o dashboard após o login
    } catch (error) {
      console.error("Erro ao fazer login:", error);
    }
  };

  return (
    <div className="h-screen flex">
      <div className="  bg-[#1E1E2F] flex flex-1 flex-col  justify-center gap-4">
        <img className="h-15 w-40" src={Logo} alt="Logo" />
        <h2 className="text-3xl font-bold text-white font-poppins">
          Bem-vindo
        </h2>
        <p></p>
        <button
          onClick={handleGoogleLogin}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 transition"
        >
          Login com Google
        </button>
      </div>
      <div className="flex-1">
        <img className="h-full w-full object-cover" src={Banner} alt="Banner" />
      </div>
    </div>
  );
}
