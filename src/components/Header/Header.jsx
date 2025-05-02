import { useEffect, useState } from "react";
import { auth } from "../../firebaseConfig";
import { signOut } from "firebase/auth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LogoHeader from "../../assets/Header/logo2.png";

export default function Header() {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Obtém o usuário autenticado
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <header className="text-white h-16 p-2 flex justify-between items-center pr-10 pl-10 border-b border-gray-700">
      <div className="flex items-center space-x-10">
        <img src={LogoHeader} alt="Logo Header" className="h-8 w-20" />
        <Link
          to="/dashboard"
          className={`text-sm font-semibold font-poppins transition duration-300 ${
            location.pathname === "/dashboard"
              ? "text-purple-700"
              : "hover:text-purple-700"
          }`}
        >
          Dashboard
        </Link>
        <Link
          to="/transacoes"
          className={`text-sm font-semibold font-poppins transition duration-300 ${
            location.pathname === "/transacoes"
              ? "text-purple-700"
              : "hover:text-purple-700"
          }`}
        >
          Transações
        </Link>
      </div>
      <div className="relative">
        {user ? (
          <div
            className="flex items-center space-x-3 border border-gray-700 rounded-full p-2 bg-[#1E1E2F] cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <img
              src={user.photoURL}
              alt="Foto de Perfil"
              className="h-8 w-8 rounded-full"
            />
            <p className="text-sm font-semibold">{user.displayName}</p>
          </div>
        ) : (
          <p className="text-sm font-semibold">Carregando...</p>
        )}
        <div
          className={`absolute right-0 mt-2 w-48 bg-[#1E1E2F] border border-gray-700 rounded-lg shadow-lg transition-all duration-300 ${
            dropdownOpen
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 pointer-events-none"
          }`}
        >
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 rounded-lg"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
