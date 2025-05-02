import { useEffect, useState } from "react";
import { auth } from "../../firebaseConfig";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // Redireciona para a página de login
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <header className="text-white h-16 p-4 flex justify-end items-center bg-[#1E1E2F] border-b border-gray-700">
      {user ? (
        <div className="flex items-center space-x-3">
          <img
            src={user.photoURL}
            alt="Foto de Perfil"
            className="h-8 w-8 rounded-full"
          />
          <p className="text-sm font-semibold">{user.displayName}</p>
          <button
            onClick={handleLogout}
            className="text-sm font-semibold text-red-500 hover:text-red-700 transition"
          >
            Sair
          </button>
        </div>
      ) : (
        <p className="text-sm font-semibold">Carregando...</p>
      )}
    </header>
  );
}
