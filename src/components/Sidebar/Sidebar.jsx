import { Link, useLocation, useNavigate } from "react-router-dom";
import LogoHeader from "../../assets/Header/logo2.png";
import { TbTransitionRightFilled } from "react-icons/tb";
import { MdDashboard } from "react-icons/md";
import { IoExit } from "react-icons/io5";
import Tree from "../../assets/tree.png";
import { useState } from "react";
import { supabase } from "../../supabaseClient";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <div
      className={`bg-gradient-to-b from-indigo-950 via-indigo-900 to-indigo-950 text-white h-screen ${
        isExpanded ? "w-64" : "w-20"
      } transition-all duration-300 ease-in-out flex flex-col items-center py-6 border-r border-indigo-800/50 fixed group z-50 shadow-2xl`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo */}
      <div className="mb-10 flex items-center justify-center">
        <img
          src={isExpanded ? LogoHeader : Tree}
          alt="Logo"
          className={`transition-all duration-300 ${
            isExpanded ? "h-10 w-auto" : "h-10 w-10"
          } object-contain`}
        />
      </div>

      {/* Conteúdo do Sidebar */}
      <nav className="flex flex-col space-y-3 w-full px-3 justify-center items-center">
        <Link
          to="/dashboard"
          className={`flex items-center px-4 py-3 rounded-xl w-full transition-all duration-200 ${
            location.pathname === "/dashboard"
              ? "bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg shadow-purple-500/30 scale-[1.02]"
              : "hover:bg-indigo-800/50 hover:scale-[1.01]"
          } group relative overflow-hidden`}
        >
          <MdDashboard
            className={`text-2xl transition-all duration-200 ${
              location.pathname === "/dashboard"
                ? "text-white"
                : "text-indigo-300"
            } ${isExpanded ? "mr-3" : "mx-auto"}`}
          />
          <span
            className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${
              isExpanded
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-4 w-0 overflow-hidden"
            }`}
          >
            Dashboard
          </span>
          {location.pathname === "/dashboard" && (
            <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          )}
        </Link>

        <Link
          to="/transacoes"
          className={`flex items-center px-4 py-3 rounded-xl w-full transition-all duration-200 ${
            location.pathname === "/transacoes"
              ? "bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg shadow-purple-500/30 scale-[1.02]"
              : "hover:bg-indigo-800/50 hover:scale-[1.01]"
          } group relative overflow-hidden`}
        >
          <TbTransitionRightFilled
            className={`text-2xl transition-all duration-200 ${
              location.pathname === "/transacoes"
                ? "text-white"
                : "text-indigo-300"
            } ${isExpanded ? "mr-3" : "mx-auto"}`}
          />
          <span
            className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${
              isExpanded
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-4 w-0 overflow-hidden"
            }`}
          >
            Transações
          </span>
          {location.pathname === "/transacoes" && (
            <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          )}
        </Link>
      </nav>

      {/* Botão de Sair */}
      <div className="mt-auto w-full px-3 pt-4 border-t border-indigo-800/50">
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-3 w-full rounded-xl transition-all duration-200 hover:bg-red-600/20 hover:scale-[1.01] group relative overflow-hidden border border-transparent hover:border-red-500/30"
        >
          <IoExit
            className={`text-2xl text-red-400 transition-all duration-200 ${
              isExpanded ? "mr-3" : "mx-auto"
            }`}
          />
          <span
            className={`text-sm font-medium text-red-400 transition-all duration-300 whitespace-nowrap ${
              isExpanded
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-4 w-0 overflow-hidden"
            }`}
          >
            Sair
          </span>
        </button>
      </div>
    </div>
  );
}
