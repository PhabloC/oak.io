import { Link, useLocation } from "react-router-dom";
import LogoHeader from "../../assets/Header/logo2.png";
import { TbTransitionRightFilled } from "react-icons/tb";
import { MdDashboard } from "react-icons/md";
import { IoExit } from "react-icons/io5"; // Importa o ícone de sair
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // Redireciona para a página de login
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <div className="bg-indigo-950 text-white h-screen w-24 hover:w-64 transition-all duration-300 flex flex-col items-center py-6 border-r border-blue-800 fixed group z-50">
      {/* Logo */}
      <img src={LogoHeader} alt="Logo" className="h-8 w-16 mb-8" />

      {/* Conteúdo do Sidebar */}
      <nav className="flex flex-col space-y-4 w-full justify-center items-center">
        <Link
          to="/dashboard"
          className={`flex items-center px-4 py-2 rounded-lg ${
            location.pathname === "/dashboard"
              ? "bg-purple-700"
              : "hover:bg-gray-700"
          } group`}
        >
          <MdDashboard className="text-xl" />
          <span className="text-sm font-semibold ml-4 hidden group-hover:block">
            Dashboard
          </span>
        </Link>
        <Link
          to="/transacoes"
          className={`flex items-center px-4 py-2 rounded-lg ${
            location.pathname === "/transacoes"
              ? "bg-purple-700"
              : "hover:bg-gray-700"
          } group`}
        >
          <TbTransitionRightFilled className="text-xl" />
          <span className="text-sm font-semibold ml-4 hidden group-hover:block">
            Transações
          </span>
        </Link>
      </nav>

      {/* Botão de Sair */}
      <div className="mt-auto w-full">
        <button
          onClick={handleLogout}
          className="flex px-4 py-2 w-full text-left rounded-lg hover:bg-gray-700 group justify-center items-center"
        >
          <IoExit className="text-xl" />
          <span className="text-sm font-semibold ml-2 hidden group-hover:block">
            Sair
          </span>
        </button>
      </div>
    </div>
  );
}
