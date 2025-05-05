import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";

// Registra os componentes necessários
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function Grafico({ lineData, pieData }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Gráfico de Linha */}
      <div className="bg-gray-800/30 backdrop-blur-md p-4 rounded-lg shadow-md w-full h-[300px]">
        <h3 className="text-xl font-bold mb-4">Gráfico de Linha</h3>
        <Line data={lineData} />
      </div>

      {/* Gráfico de Pizza */}
      <div className="bg-gray-800/30 backdrop-blur-md p-4 rounded-lg shadow-md w-full h-[300px]">
        <h3 className="text-xl font-bold mb-4">Gráfico de Pizza</h3>
        <Pie data={pieData} />
      </div>
    </div>
  );
}
