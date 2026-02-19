import { useTransactions } from "../../context/TransactionsContext";
import { useNavigate } from "react-router-dom";

export default function Quadro({ selectedMonth }) {
  const { transactions } = useTransactions();
  const navigate = useNavigate(); // Hook para navegação

  // Filtra as transações com base no mês selecionado
  const filteredTransactions = transactions.filter(
    (transaction) => transaction.month === selectedMonth
  );

  return (
    <div className="bg-gradient-to-br from-gray-800/40 via-gray-800/30 to-gray-800/40 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-xl shadow-purple-500/10 w-full lg:w-[350px] xl:w-[400px] h-auto lg:max-h-[600px] overflow-y-auto lg:ml-0 border border-indigo-500/20 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20">
      <div className="flex justify-between items-center mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-700/50">
        <h3 className="text-lg sm:text-xl font-bold text-white">Transações do Mês</h3>
        <button
          onClick={() => navigate("/transacoes")}
          className="cursor-pointer border border-indigo-500/50 rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:text-white hover:border-indigo-400 text-xs sm:text-sm text-indigo-300 transition-all duration-200 font-medium hover:scale-[1.05] shadow-md hover:shadow-lg hover:shadow-indigo-500/30"
        >
          Ver mais
        </button>
      </div>
      <ul className="space-y-2 sm:space-y-3">
        {filteredTransactions.length === 0 ? (
          <li className="text-gray-400 text-center py-6 sm:py-8 px-4 rounded-xl bg-gray-800/30 border border-gray-700/30 text-sm sm:text-base">
            Nenhuma transação encontrada.
          </li>
        ) : (
          filteredTransactions.map((transaction) => (
            <li 
              key={transaction.id} 
              className="flex justify-between items-center p-2.5 sm:p-3 rounded-xl bg-gray-800/30 border border-gray-700/30 hover:bg-gray-800/50 hover:border-indigo-500/30 transition-all duration-200 hover:scale-[1.02] gap-2"
            >
              <span className="text-white font-medium text-sm sm:text-base truncate flex-1">{transaction.title}</span>
              <span
                className={`font-bold text-sm sm:text-lg flex-shrink-0 ${
                  transaction.type === "Gasto"
                    ? "text-red-400"
                    : transaction.type === "Investimento"
                    ? "text-blue-400"
                    : "text-green-400"
                }`}
              >
                {transaction.type === "Gasto"
                  ? `- R$ ${Math.abs(transaction.value).toFixed(2)}`
                  : `+ R$ ${transaction.value.toFixed(2)}`}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
