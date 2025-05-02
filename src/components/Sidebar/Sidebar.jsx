import { Link, useLocation } from "react-router-dom";
import LogoHeader from "../../assets/Header/logo2.png";

export default function Sidebar() {
  const location = useLocation();

  return (
    <div
      className="bg-indigo-950 text-white h-screen w-24 hover:w-64 transition-all duration-300 flex flex-col items-center py-6
    border-r border-gray-700"
    >
      {/* Logo */}
      <img src={LogoHeader} alt="Logo" className="h-8 w-16 mb-8" />

      {/* Links */}
      <nav className="flex flex-col space-y-4">
        <Link
          to="/dashboard"
          className={`flex items-center space-x-4 px-4 py-2 rounded-lg ${
            location.pathname === "/dashboard"
              ? "bg-purple-700"
              : "hover:bg-gray-700"
          }`}
        >
          <span className="material-icons">Dashboard</span>
          <span className="text-sm font-semibold hidden hover:block">
            Dashboard
          </span>
        </Link>
        <Link
          to="/transacoes"
          className={`flex items-center space-x-4 px-4 py-2 rounded-lg ${
            location.pathname === "/transacoes"
              ? "bg-purple-700"
              : "hover:bg-gray-700"
          }`}
        >
          <span className="material-icons">Transações</span>
          <span className="text-sm font-semibold hidden hover:block">
            Transações
          </span>
        </Link>
      </nav>
    </div>
  );
}
