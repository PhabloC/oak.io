import { useEffect, useState } from "react";
import { auth } from "../../firebaseConfig";

export default function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  return (
    <header className="text-white h-16 p-4 flex justify-end items-center bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-950 border-b border-indigo-800/50 shadow-lg backdrop-blur-sm">
      {user ? (
        <div className="flex items-center space-x-4 px-4 py-2 rounded-xl bg-indigo-800/30 border border-indigo-700/30 hover:bg-indigo-800/50 transition-all duration-200 hover:scale-[1.02]">
          <img
            src={user.photoURL}
            alt="Foto de Perfil"
            className="h-10 w-10 rounded-full border-2 border-indigo-400/50 shadow-lg"
          />
          <p className="text-sm font-semibold text-indigo-100">{user.displayName}</p>
        </div>
      ) : (
        <div className="px-4 py-2 rounded-xl bg-indigo-800/30 border border-indigo-700/30">
          <p className="text-sm font-semibold text-indigo-200 animate-pulse">Carregando...</p>
        </div>
      )}
    </header>
  );
}
