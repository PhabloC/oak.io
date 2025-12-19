import { BsBoxArrowUpRight } from "react-icons/bs";
import { FaTrash } from "react-icons/fa";

// Função para formatar data YYYY-MM-DD para DD/MM/YYYY
const formatDate = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

export default function TransactionsTable({ transactions, onEdit, onDelete }) {
  const getTypeBadgeClass = (type) => {
    switch (type) {
      case "Ganho":
        return "bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 border-green-500/30";
      case "Gasto":
        return "bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 border-red-500/30";
      case "Investimento":
        return "bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 border-blue-500/30";
      default:
        return "bg-gray-700/50 text-gray-300 border-gray-600/30";
    }
  };

  const getMethodBadgeClass = (method) => {
    switch (method) {
      case "Pix":
        return "bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-300 border-purple-500/30";
      case "Cartão":
        return "bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 text-indigo-300 border-indigo-500/30";
      case "Boleto":
        return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-300 border-yellow-500/30";
      default:
        return "bg-gray-700/50 text-gray-300 border-gray-600/30";
    }
  };

  return (
    <div className="overflow-x-auto mt-8 rounded-xl shadow-xl shadow-purple-500/10 border border-indigo-500/20 bg-gradient-to-br from-gray-800/40 via-gray-800/30 to-gray-800/40 backdrop-blur-md">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-indigo-900/50 via-purple-900/50 to-indigo-900/50 border-b border-indigo-500/30">
            <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-indigo-200 uppercase tracking-wider">
              Nome
            </th>
            <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-indigo-200 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-indigo-200 uppercase tracking-wider">
              Método
            </th>
            <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-indigo-200 uppercase tracking-wider">
              Data
            </th>
            <th className="px-4 sm:px-6 py-4 text-right text-xs sm:text-sm font-semibold text-indigo-200 uppercase tracking-wider">
              Valor
            </th>
            <th className="px-4 sm:px-6 py-4 text-center text-xs sm:text-sm font-semibold text-indigo-200 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700/30">
          {transactions.length === 0 ? (
            <tr>
              <td
                colSpan="6"
                className="px-4 sm:px-6 py-12 text-center text-gray-400 text-sm sm:text-base"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <p className="font-medium">Nenhuma transação encontrada.</p>
                  <p className="text-xs text-gray-500">
                    Adicione uma transação para começar
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            transactions.map((transaction, index) => (
              <tr
                key={transaction.id}
                className="bg-gray-800/20 hover:bg-gradient-to-r hover:from-indigo-900/20 hover:via-purple-900/20 hover:to-indigo-900/20 transition-all duration-200 group border-b border-gray-700/20 animate-fadeInRow"
                style={{
                  animationDelay: `${index * 0.05}s`,
                }}
              >
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <div className="text-sm sm:text-base font-medium text-white group-hover:text-indigo-200 transition-colors">
                    {transaction.title}
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold border ${getTypeBadgeClass(
                      transaction.type
                    )}`}
                  >
                    {transaction.type}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold border ${getMethodBadgeClass(
                      transaction.method
                    )}`}
                  >
                    {transaction.method}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm sm:text-base text-gray-300">
                  {formatDate(transaction.date)}
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                  <span
                    className={`text-sm sm:text-base font-bold ${
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
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(transaction)}
                      className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 hover:border-blue-400/50 text-blue-400 hover:text-blue-300 transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/30 group/edit"
                      title="Editar transação"
                    >
                      <BsBoxArrowUpRight className="text-sm sm:text-base group-hover/edit:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={() => onDelete(transaction)}
                      className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 hover:border-red-400/50 text-red-400 hover:text-red-300 transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-red-500/30 group/delete"
                      title="Deletar transação"
                    >
                      <FaTrash className="text-sm sm:text-base group-hover/delete:scale-110 transition-transform" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
