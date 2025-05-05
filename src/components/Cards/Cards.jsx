import { FaWallet } from "react-icons/fa";
import { AiFillDollarCircle } from "react-icons/ai";
import { GiExpense } from "react-icons/gi";

export default function Cards() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Card Saldo */}
      <div className="bg-lime-600 backdrop-blur-md p-8 rounded-lg shadow-md flex items-center justify-between w-full">
        <div>
          <h3>Saldo no mês</h3>
          <p>R$ 5000</p>
        </div>
        <div className="text-2xl">
          <FaWallet />
        </div>
      </div>

      {/* Card Gastos */}
      <div className="bg-red-700 backdrop-blur-md p-8 rounded-lg shadow-md flex items-center justify-between w-full">
        <div>
          <h3>Gastos no mês</h3>
          <p>R$ 2000</p>
        </div>
        <div className="text-2xl">
          <GiExpense />
        </div>
      </div>

      {/* Card Investimentos */}
      <div className="bg-blue-700 backdrop-blur-md p-8 rounded-lg shadow-md flex items-center justify-between w-full">
        <div>
          <h3>Valor investido</h3>
          <p>R$ 1500</p>
        </div>
        <div className="text-2xl">
          <AiFillDollarCircle />
        </div>
      </div>
    </div>
  );
}
