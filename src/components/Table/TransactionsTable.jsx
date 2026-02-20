import { BsBoxArrowUpRight } from "react-icons/bs";
import { FaTrash, FaCheck } from "react-icons/fa";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

export default function TransactionsTable({ transactions, onEdit, onDelete, onTogglePaga }) {
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

  if (transactions.length === 0) {
    return (
      <div className="mt-6 rounded-xl shadow-xl shadow-purple-500/10 border border-indigo-500/20 bg-gradient-to-br from-gray-800/40 via-gray-800/30 to-gray-800/40 backdrop-blur-md p-8">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <p className="font-medium text-gray-400">Nenhuma transação encontrada.</p>
          <p className="text-xs text-gray-500">
            Adicione uma transação para começar
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Cards */}
      <div className="md:hidden mt-6 space-y-3">
        {transactions.map((transaction, index) => (
          <div
            key={transaction.id}
            className="bg-gradient-to-br from-gray-800/40 via-gray-800/30 to-gray-800/40 backdrop-blur-md rounded-xl border border-indigo-500/20 p-4 shadow-lg"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-base truncate">
                  {transaction.title}
                </h3>
                <p className="text-gray-400 text-xs mt-1">
                  {formatDate(transaction.date)}
                </p>
              </div>
              <span
                className={`text-lg font-bold ml-3 ${
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
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getTypeBadgeClass(
                  transaction.type
                )}`}
              >
                {transaction.type}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getMethodBadgeClass(
                  transaction.method
                )}`}
              >
                {transaction.method}
              </span>
              {transaction.category && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {transaction.category}
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${
                  transaction.paga
                    ? "bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-300 border-emerald-500/30"
                    : "bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-300 border-orange-500/30"
                }`}
              >
                {transaction.paga && <FaCheck className="text-[10px]" />}
                {transaction.paga ? "Paga" : "Em aberto"}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-700/30">
              <button
                onClick={() => onTogglePaga(transaction)}
                className={`p-2 rounded-lg border transition-all duration-200 ${
                  transaction.paga
                    ? "bg-emerald-600/20 hover:bg-emerald-600/40 border-emerald-500/30 text-emerald-400"
                    : "bg-orange-600/20 hover:bg-orange-600/40 border-orange-500/30 text-orange-400"
                }`}
                title={transaction.paga ? "Marcar como em aberto" : "Marcar como paga"}
              >
                <FaCheck className="text-sm" />
              </button>
              <button
                onClick={() => onEdit(transaction)}
                className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-400 transition-all duration-200"
                title="Editar"
              >
                <BsBoxArrowUpRight className="text-sm" />
              </button>
              <button
                onClick={() => onDelete(transaction)}
                className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-400 transition-all duration-200"
                title="Deletar"
              >
                <FaTrash className="text-sm" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto mt-6 rounded-xl shadow-xl shadow-purple-500/10 border border-indigo-500/20 bg-gradient-to-br from-gray-800/40 via-gray-800/30 to-gray-800/40 backdrop-blur-md">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-900/50 via-purple-900/50 to-indigo-900/50 border-b border-indigo-500/30">
              <th className="px-4 lg:px-6 py-4 text-left text-xs lg:text-sm font-semibold text-indigo-200 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-4 lg:px-6 py-4 text-left text-xs lg:text-sm font-semibold text-indigo-200 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-4 lg:px-6 py-4 text-left text-xs lg:text-sm font-semibold text-indigo-200 uppercase tracking-wider">
                Método
              </th>
              <th className="px-4 lg:px-6 py-4 text-left text-xs lg:text-sm font-semibold text-indigo-200 uppercase tracking-wider hidden lg:table-cell">
                Categoria
              </th>
              <th className="px-4 lg:px-6 py-4 text-left text-xs lg:text-sm font-semibold text-indigo-200 uppercase tracking-wider">
                Data
              </th>
              <th className="px-4 lg:px-6 py-4 text-center text-xs lg:text-sm font-semibold text-indigo-200 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 lg:px-6 py-4 text-right text-xs lg:text-sm font-semibold text-indigo-200 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-4 lg:px-6 py-4 text-center text-xs lg:text-sm font-semibold text-indigo-200 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/30">
            {transactions.map((transaction, index) => (
              <tr
                key={transaction.id}
                className="bg-gray-800/20 hover:bg-gradient-to-r hover:from-indigo-900/20 hover:via-purple-900/20 hover:to-indigo-900/20 transition-all duration-200 group border-b border-gray-700/20"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <div className="text-sm lg:text-base font-medium text-white group-hover:text-indigo-200 transition-colors">
                    {transaction.title}
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2 lg:px-3 py-1 rounded-lg text-xs lg:text-sm font-semibold border ${getTypeBadgeClass(
                      transaction.type
                    )}`}
                  >
                    {transaction.type}
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2 lg:px-3 py-1 rounded-lg text-xs lg:text-sm font-semibold border ${getMethodBadgeClass(
                      transaction.method
                    )}`}
                  >
                    {transaction.method}
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                  {transaction.category ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {transaction.category}
                    </span>
                  ) : (
                    <span className="text-gray-500 text-sm">-</span>
                  )}
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm lg:text-base text-gray-300">
                  {formatDate(transaction.date)}
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-center">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 lg:px-3 py-1 rounded-lg text-xs lg:text-sm font-semibold border ${
                      transaction.paga
                        ? "bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-300 border-emerald-500/30"
                        : "bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-300 border-orange-500/30"
                    }`}
                  >
                    {transaction.paga && <FaCheck className="text-xs" />}
                    {transaction.paga ? "Paga" : "Em aberto"}
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right">
                  <span
                    className={`text-sm lg:text-base font-bold ${
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
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onTogglePaga(transaction)}
                      className={`p-2 rounded-lg border transition-all duration-200 hover:scale-110 ${
                        transaction.paga
                          ? "bg-emerald-600/20 hover:bg-emerald-600/40 border-emerald-500/30 hover:border-emerald-400/50 text-emerald-400 hover:text-emerald-300"
                          : "bg-orange-600/20 hover:bg-orange-600/40 border-orange-500/30 hover:border-orange-400/50 text-orange-400 hover:text-orange-300"
                      }`}
                      title={transaction.paga ? "Marcar como em aberto" : "Marcar como paga"}
                    >
                      <FaCheck className="text-sm lg:text-base" />
                    </button>
                    <button
                      onClick={() => onEdit(transaction)}
                      className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 hover:border-blue-400/50 text-blue-400 hover:text-blue-300 transition-all duration-200 hover:scale-110"
                      title="Editar transação"
                    >
                      <BsBoxArrowUpRight className="text-sm lg:text-base" />
                    </button>
                    <button
                      onClick={() => onDelete(transaction)}
                      className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 hover:border-red-400/50 text-red-400 hover:text-red-300 transition-all duration-200 hover:scale-110"
                      title="Deletar transação"
                    >
                      <FaTrash className="text-sm lg:text-base" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
