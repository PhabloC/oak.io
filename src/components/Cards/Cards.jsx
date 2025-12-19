import { FaWallet } from "react-icons/fa";
import { AiFillDollarCircle } from "react-icons/ai";
import { GiExpense } from "react-icons/gi";

export default function Cards({ saldo, gastos, investimentos }) {
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Card Saldo */}
      <div className="bg-gradient-to-br from-lime-500 via-lime-600 to-lime-700 backdrop-blur-md p-8 rounded-xl shadow-lg shadow-lime-500/30 flex items-center justify-between w-full transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-lime-500/40 border border-lime-400/20">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2 opacity-90">Saldo no mês</h3>
          <p
            className={`text-2xl font-bold transition-colors duration-200 ${
              saldo >= 0 ? "text-white" : "text-red-100"
            }`}
          >
            {saldo < 0 ? "-" : ""} R$ {Math.abs(saldo).toFixed(2)}
          </p>
        </div>
        <div className="text-4xl text-white/90 ml-4">
          <FaWallet />
        </div>
      </div>

      {/* Card Gastos */}
      <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 backdrop-blur-md p-8 rounded-xl shadow-lg shadow-red-500/30 flex items-center justify-between w-full transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-red-500/40 border border-red-400/20">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2 opacity-90">Gastos no mês</h3>
          <p className="text-2xl font-bold text-white">R$ {gastos.toFixed(2)}</p>
        </div>
        <div className="text-4xl text-white/90 ml-4">
          <GiExpense />
        </div>
      </div>

      {/* Card Investimentos */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 backdrop-blur-md p-8 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-between w-full transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/40 border border-blue-400/20">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2 opacity-90">Valor investido</h3>
          <p className="text-2xl font-bold text-white">
            R$ {investimentos.toFixed(2)}
          </p>
        </div>
        <div className="text-4xl text-white/90 ml-4">
          <AiFillDollarCircle />
        </div>
      </div>
    </div>
  );
}
