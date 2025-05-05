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
    <header className="text-white h-16 p-4 flex justify-end items-center bg-[#1E1E2F] border-b border-gray-700">
      {user ? (
        <div className="flex items-center space-x-3">
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
    </header>
  );
}
