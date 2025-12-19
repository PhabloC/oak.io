export default function ModalDeleted({ onClose, onDelete }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-2 animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 p-6 sm:p-8 rounded-xl shadow-2xl shadow-red-500/20 w-full max-w-xs sm:max-w-md border border-gray-700/50 transition-all duration-300 animate-scaleIn">
        {/* Título */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 text-white">
            Deseja deletar essa transação?
          </h2>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            Uma vez deletada, não poderá recuperá-la.
          </p>
        </div>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-500 hover:to-gray-600 w-full sm:w-auto transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] border border-gray-500/30"
          >
            Cancelar
          </button>
          <button
            onClick={onDelete}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-500 hover:to-red-600 w-full sm:w-auto transition-all duration-200 font-medium shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:scale-[1.02] border border-red-500/30"
          >
            Deletar
          </button>
        </div>
      </div>
    </div>
  );
}
