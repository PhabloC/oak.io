export default function Quadro() {
  return (
    <div className="bg-gray-800/30 backdrop-blur-md p-4 rounded-lg shadow-md w-[400px] h-full overflow-y-auto ml-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold mb-4">Transações</h3>
        <p className="cursor-pointer border border-gray-600 rounded-lg px-4 py-1 hover:bg-gray-600 hover:text-white text-sm text-gray-400 mb-4">
          Ver mais
        </p>
      </div>
      <ul className="space-y-2">
        <li className="flex justify-between">
          <span>Compra no mercado</span>
          <span className="text-red-500">- R$ 200</span>
        </li>
        <li className="flex justify-between">
          <span>Salário</span>
          <span className="text-green-500">+ R$ 5000</span>
        </li>
        <li className="flex justify-between">
          <span>Investimento</span>
          <span className="text-blue-500">- R$ 1500</span>
        </li>
      </ul>
    </div>
  );
}
