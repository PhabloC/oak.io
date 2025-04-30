// filepath: c:\Users\phabl\Desktop\projects\oak-io\src\components\ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        navigate("/"); // Redireciona para login se não estiver autenticado
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return <div className="text-white">Carregando...</div>;
  }

  return isAuthenticated ? children : null;
}
