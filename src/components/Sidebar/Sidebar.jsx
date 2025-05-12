import { Link, useLocation } from "react-router-dom";
import LogoHeader from "../../assets/Header/logo2.png";
import { TbTransitionRightFilled } from "react-icons/tb";
import { MdDashboard } from "react-icons/md";
import { IoExit } from "react-icons/io5";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import Tree from "../../assets/tree.png";
import { useState } from "react";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <div
      className={`bg-indigo-950 text-white h-screen ${
        isExpanded ? "w-64" : "w-24"
      } transition-all duration-300 flex flex-col items-center py-6 border-r border-blue-800 fixed group z-50`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo */}
      <img
        src={isExpanded ? LogoHeader : Tree}
        alt="Logo"
        className={`transition-all duration-300 mb-8 ${
          isExpanded ? "h-8 w-16" : "h-8 w-8"
        }`}
      />

      {/* Conteúdo do Sidebar */}
      <nav className="flex flex-col space-y-4 w-full justify-center items-center">
        <Link
          to="/dashboard"
          className={`flex items-center px-4 py-2 rounded-lg w-11/12 text-center justify-center ${
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
          className={`flex items-center px-4 py-2 rounded-lg w-11/12 text-center justify-center ${
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
      <div className="mt-auto w-full p-2">
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
