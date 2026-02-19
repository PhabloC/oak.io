import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import { FaChartLine } from "react-icons/fa";

export default function Investimento() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const showSidebar =
    location.pathname === "/dashboard" ||
    location.pathname === "/transacoes" ||
    location.pathname === "/metas" ||
    location.pathname === "/dividas" ||
    location.pathname === "/investimento";

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="text-white flex min-h-screen">
      {showSidebar && (
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      )}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <div className="p-4 md:ml-28 ml-0 flex flex-col pb-8 flex-1">
          <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-gradient-to-br from-gray-800/40 via-gray-800/30 to-gray-800/40 backdrop-blur-md p-12 rounded-xl border border-indigo-500/20 text-center max-w-md">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-indigo-600/30 rounded-full flex items-center justify-center">
                  <FaChartLine className="text-4xl text-indigo-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Investimento
              </h2>
              <p className="text-indigo-300 text-lg font-medium">
                Em breve
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Estamos trabalhando nesta funcionalidade. Em breve você poderá acompanhar seus investimentos por aqui.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
