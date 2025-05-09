import { FaWallet } from "react-icons/fa";
import { AiFillDollarCircle } from "react-icons/ai";
import { GiExpense } from "react-icons/gi";

export default function Cards({ saldo, gastos, investimentos }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Card Saldo */}
      <div className="bg-lime-600 backdrop-blur-md p-8 rounded-lg shadow-md flex items-center justify-between w-full">
        <div>
          <h3 className="text-lg font-semibold text-white">Saldo no mês</h3>
          <p
            className={`text-xl font-bold ${
              saldo >= 0 ? "text-white" : "text-red-200"
            }`}
          >
            {saldo < 0 ? "-" : ""} R$ {Math.abs(saldo).toFixed(2)}
          </p>
        </div>
        <div className="text-2xl text-white">
          <FaWallet />
        </div>
      </div>

      {/* Card Gastos */}
      <div className="bg-red-700 backdrop-blur-md p-8 rounded-lg shadow-md flex items-center justify-between w-full">
        <div>
          <h3 className="text-lg font-semibold text-white">Gastos no mês</h3>
          <p className="text-xl font-bold text-white">R$ {gastos.toFixed(2)}</p>
        </div>
        <div className="text-2xl text-white">
          <GiExpense />
        </div>
      </div>

      {/* Card Investimentos */}
      <div className="bg-blue-700 backdrop-blur-md p-8 rounded-lg shadow-md flex items-center justify-between w-full">
        <div>
          <h3 className="text-lg font-semibold text-white">Valor investido</h3>
          <p className="text-xl font-bold text-white">
            R$ {investimentos.toFixed(2)}
          </p>
        </div>
        <div className="text-2xl text-white">
          <AiFillDollarCircle />
        </div>
      </div>
    </div>
  );
}
