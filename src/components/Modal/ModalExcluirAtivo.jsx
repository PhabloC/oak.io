import { IoClose } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";

export default function ModalExcluirAtivo({ ativo, onClose, onConfirm }) {
  if (!ativo) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-2 animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-700/50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Excluir ativo</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <IoClose className="text-2xl" />
          </button>
        </div>

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center">
            <FaTrash className="text-3xl text-red-400" />
          </div>
        </div>

        <p className="text-gray-300 text-center mb-4">
          Tem certeza que deseja excluir o ativo{" "}
          <span className="font-semibold text-white">&quot;{ativo.nome}&quot;</span>?
        </p>

        <p className="text-red-400 text-sm text-center mb-6">
          Esta ação não pode ser desfeita. Todos os dados desse ativo serão
          perdidos.
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-gray-600 text-gray-300 hover:bg-gray-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm()}
            className="px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-500 transition-colors font-medium"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
