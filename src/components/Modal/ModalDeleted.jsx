export default function ModalDeleted({ onClose, onDelete }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-[400px]">
        {/* Título */}
        <h2 className="text-xl font-bold mb-4">
          Deseja deletar essa transação?
        </h2>
        <p className="text-gray-400 mb-6">
          Uma vez deletada, não poderá recuperá-la.
        </p>

        {/* Botões */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
          >
            Cancelar
          </button>
          <button
            onClick={onDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500"
          >
            Deletar
          </button>
        </div>
      </div>
    </div>
  );
}
