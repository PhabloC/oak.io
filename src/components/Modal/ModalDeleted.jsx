export default function ModalDeleted({ onClose, onDelete }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-2">
      <div className="bg-gray-800 p-4 sm:p-6 rounded-lg w-full max-w-xs sm:max-w-md">
        {/* Título */}
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-white">
          Deseja deletar essa transação?
        </h2>
        <p className="text-gray-400 mb-6 text-sm sm:text-base">
          Uma vez deletada, não poderá recuperá-la.
        </p>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 w-full sm:w-auto"
          >
            Cancelar
          </button>
          <button
            onClick={onDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 w-full sm:w-auto"
          >
            Deletar
          </button>
        </div>
      </div>
    </div>
  );
}
