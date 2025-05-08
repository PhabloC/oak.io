import { useTransactions } from "../../context/TransactionsContext";

export default function Quadro({ selectedMonth }) {
  const { transactions } = useTransactions();

  // Filtra as transações com base no mês selecionado
  const filteredTransactions = transactions.filter(
    (transaction) => transaction.month === selectedMonth
  );

  return (
    <div className="bg-gray-800/30 backdrop-blur-md p-4 rounded-lg shadow-md w-[400px] h-full overflow-y-auto ml-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold mb-4">Transações do Mês</h3>
        <p className="cursor-pointer border border-gray-600 rounded-lg px-4 py-1 hover:bg-gray-600 hover:text-white text-sm text-gray-400 mb-4">
          Ver mais
        </p>
      </div>
      <ul className="space-y-2">
        {filteredTransactions.length === 0 ? (
          <li className="text-gray-400 text-center">
            Nenhuma transação encontrada.
          </li>
        ) : (
          filteredTransactions.map((transaction) => (
            <li key={transaction.id} className="flex justify-between">
              <span>{transaction.title}</span>
              <span
                className={`${
                  transaction.type === "Gasto"
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                {transaction.type === "Gasto"
                  ? `- R$ ${Math.abs(transaction.value)}`
                  : `+ R$ ${transaction.value}`}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
