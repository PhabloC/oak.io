import { Link, useLocation, useNavigate } from "react-router-dom";
import LogoHeader from "../../assets/Header/logo2.png";
import { MdDashboard } from "react-icons/md";
import { FaFileInvoiceDollar, FaTimes } from "react-icons/fa";
import { IoExit } from "react-icons/io5";
import Tree from "../../assets/tree.png";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabaseClient";
import { MdInsertChart } from "react-icons/md";
import { TfiTarget } from "react-icons/tfi";
import { AiFillDollarCircle } from "react-icons/ai";
import { IoPersonCircle } from "react-icons/io5";

export default function Sidebar({ isMobileOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (prevPathRef.current !== location.pathname && isMobile && onClose) {
      onClose();
    }
    prevPathRef.current = location.pathname;
  }, [location.pathname, isMobile, onClose]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  if (isMobile && !isMobileOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay para mobile */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] sidebar-overlay"
          onClick={handleClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`bg-gradient-to-b from-indigo-950 via-indigo-900 to-indigo-950 text-white h-screen ${
          isMobile ? "w-64 sidebar-mobile-open" : isExpanded ? "w-64" : "w-20"
        } transition-all duration-300 ease-in-out flex flex-col items-center py-6 border-r border-indigo-800/50 fixed group z-[110] shadow-2xl`}
        onMouseEnter={() => !isMobile && setIsExpanded(true)}
        onMouseLeave={() => !isMobile && setIsExpanded(false)}
      >
        {/* Botão fechar mobile */}
        {isMobile && (
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-indigo-800/50 transition-colors sidebar-content-item"
          >
            <FaTimes className="text-xl text-indigo-300" />
          </button>
        )}

        {/* Logo */}
        <div className="mb-10 flex items-center justify-center">
          <img
            src={isMobile || isExpanded ? LogoHeader : Tree}
            alt="Logo"
            className={`transition-all duration-300 ${
              isMobile || isExpanded ? "h-10 w-auto" : "h-10 w-10"
            } object-contain`}
          />
        </div>

        {/* Conteúdo do Sidebar */}
        <nav className="flex flex-col space-y-3 w-full px-3 justify-center items-center">
          <Link
            to="/dashboard"
            onClick={handleLinkClick}
            className={`flex items-center px-4 py-3 rounded-xl w-full transition-all duration-200 ${
              location.pathname === "/dashboard"
                ? "bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg shadow-purple-500/30 scale-[1.02]"
                : "hover:bg-indigo-800/50 hover:scale-[1.01]"
            } group relative overflow-hidden ${isMobile ? "sidebar-content-item" : ""}`}
          >
            <MdDashboard
              className={`text-2xl transition-all duration-200 ${
                location.pathname === "/dashboard"
                  ? "text-white"
                  : "text-indigo-300"
              } ${isMobile || isExpanded ? "mr-3" : "mx-auto"}`}
            />
            <span
              className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                isMobile || isExpanded
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
            onClick={handleLinkClick}
            className={`flex items-center px-4 py-3 rounded-xl w-full transition-all duration-200 ${
              location.pathname === "/transacoes"
                ? "bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg shadow-purple-500/30 scale-[1.02]"
                : "hover:bg-indigo-800/50 hover:scale-[1.01]"
            } group relative overflow-hidden ${isMobile ? "sidebar-content-item" : ""}`}
          >
            <AiFillDollarCircle
              className={`text-2xl transition-all duration-200 ${
                location.pathname === "/transacoes"
                  ? "text-white"
                  : "text-indigo-300"
              } ${isMobile || isExpanded ? "mr-3" : "mx-auto"}`}
            />
            <span
              className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                isMobile || isExpanded
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

          <Link
            to="/metas"
            onClick={handleLinkClick}
            className={`flex items-center px-4 py-3 rounded-xl w-full transition-all duration-200 ${
              location.pathname === "/metas"
                ? "bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg shadow-purple-500/30 scale-[1.02]"
                : "hover:bg-indigo-800/50 hover:scale-[1.01]"
            } group relative overflow-hidden ${isMobile ? "sidebar-content-item" : ""}`}
          >
            <TfiTarget
              className={`text-2xl transition-all duration-200 ${
                location.pathname === "/metas"
                  ? "text-white"
                  : "text-indigo-300"
              } ${isMobile || isExpanded ? "mr-3" : "mx-auto"}`}
            />
            <span
              className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                isMobile || isExpanded
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-4 w-0 overflow-hidden"
              }`}
            >
              Metas
            </span>
            {location.pathname === "/metas" && (
              <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            )}
          </Link>

          <Link
            to="/dividas"
            onClick={handleLinkClick}
            className={`flex items-center px-4 py-3 rounded-xl w-full transition-all duration-200 ${
              location.pathname === "/dividas"
                ? "bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg shadow-purple-500/30 scale-[1.02]"
                : "hover:bg-indigo-800/50 hover:scale-[1.01]"
            } group relative overflow-hidden ${isMobile ? "sidebar-content-item" : ""}`}
          >
            <FaFileInvoiceDollar
              className={`text-2xl transition-all duration-200 ${
                location.pathname === "/dividas"
                  ? "text-white"
                  : "text-indigo-300"
              } ${isMobile || isExpanded ? "mr-3" : "mx-auto"}`}
            />
            <span
              className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                isMobile || isExpanded
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-4 w-0 overflow-hidden"
              }`}
            >
              Dívidas
            </span>
            {location.pathname === "/dividas" && (
              <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            )}
          </Link>

          <Link
            to="/investimento"
            onClick={handleLinkClick}
            className={`flex items-center px-4 py-3 rounded-xl w-full transition-all duration-200 ${
              location.pathname === "/investimento"
                ? "bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg shadow-purple-500/30 scale-[1.02]"
                : "hover:bg-indigo-800/50 hover:scale-[1.01]"
            } group relative overflow-hidden ${isMobile ? "sidebar-content-item" : ""}`}
          >
            <MdInsertChart
              className={`text-2xl transition-all duration-200 ${
                location.pathname === "/investimento"
                  ? "text-white"
                  : "text-indigo-300"
              } ${isMobile || isExpanded ? "mr-3" : "mx-auto"}`}
            />
            <span
              className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                isMobile || isExpanded
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-4 w-0 overflow-hidden"
              }`}
            >
              Investimento
            </span>
            {location.pathname === "/investimento" && (
              <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            )}
          </Link>

          <Link
            to="/perfil"
            onClick={handleLinkClick}
            className={`flex items-center px-4 py-3 rounded-xl w-full transition-all duration-200 ${
              location.pathname === "/perfil"
                ? "bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg shadow-purple-500/30 scale-[1.02]"
                : "hover:bg-indigo-800/50 hover:scale-[1.01]"
            } group relative overflow-hidden ${isMobile ? "sidebar-content-item" : ""}`}
          >
            <IoPersonCircle
              className={`text-2xl transition-all duration-200 ${
                location.pathname === "/perfil"
                  ? "text-white"
                  : "text-indigo-300"
              } ${isMobile || isExpanded ? "mr-3" : "mx-auto"}`}
            />
            <span
              className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                isMobile || isExpanded
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-4 w-0 overflow-hidden"
              }`}
            >
              Perfil
            </span>
            {location.pathname === "/perfil" && (
              <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            )}
          </Link>
        </nav>

        {/* Botão de Sair */}
        <div
          className={`mt-auto w-full px-3 pt-4 border-t border-indigo-800/50 ${isMobile ? "sidebar-content-item" : ""}`}
        >
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-3 w-full rounded-xl transition-all duration-200 hover:bg-red-600/20 hover:scale-[1.01] group relative overflow-hidden border border-transparent hover:border-red-500/30"
          >
            <IoExit
              className={`text-2xl text-red-400 transition-all duration-200 ${
                isMobile || isExpanded ? "mr-3" : "mx-auto"
              }`}
            />
            <span
              className={`text-sm font-medium text-red-400 transition-all duration-300 whitespace-nowrap ${
                isMobile || isExpanded
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-4 w-0 overflow-hidden"
              }`}
            >
              Sair
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
