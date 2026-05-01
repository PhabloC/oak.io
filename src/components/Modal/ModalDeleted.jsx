import { IoClose } from "react-icons/io5";

export default function ModalDeleted({
  transaction,
  selectedMonth,
  onClose,
  onDelete,
  onDeleteCurrentMonth,
}) {
  const isRecurring = Boolean(transaction?.todos_meses);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-2 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 p-6 sm:p-8 rounded-xl shadow-2xl shadow-red-500/20 w-full max-w-xs sm:max-w-md border border-gray-700/50 transition-all duration-300 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Fechar modal"
        >
          <IoClose className="text-2xl" />
        </button>
        {/* Título */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 text-white">
            {isRecurring
              ? "Excluir transação recorrente"
              : "Deseja deletar essa transação?"}
          </h2>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            {isRecurring
              ? `Escolha se deseja excluir somente ${selectedMonth} ou remover a transação de todos os meses.`
              : "Uma vez deletada, não poderá recuperá-la."}
          </p>
        </div>

        {/* Botões */}
        <div className="flex flex-col justify-end gap-3">
          {isRecurring ? (
            <>
              <button
                onClick={onDeleteCurrentMonth}
                className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-3 rounded-xl hover:from-amber-500 hover:to-amber-600 w-full sm:w-auto transition-all duration-200 font-medium shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:scale-[1.02] border border-amber-500/30"
              >
                Excluir só {selectedMonth}
              </button>
              <button
                onClick={onDelete}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-500 hover:to-red-600 w-full sm:w-auto transition-all duration-200 font-medium shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:scale-[1.02] border border-red-500/30"
              >
                Excluir todos os meses
              </button>
            </>
          ) : (
            <button
              onClick={onDelete}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-500 hover:to-red-600 w-full sm:w-auto transition-all duration-200 font-medium shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:scale-[1.02] border border-red-500/30"
            >
              Deletar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
