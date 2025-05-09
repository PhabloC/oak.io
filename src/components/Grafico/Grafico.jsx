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
  // Opções para o gráfico de pizza
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#ffffff",
          font: {
            size: 12,
          },
          usePointStyle: true,
          pointStyle: "circle",
          padding: 12,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce(
              (acc, val) => acc + val,
              0
            );
            const percentage =
              total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: R$ ${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: "#ffffff",
        hoverOffset: 20,
        shadowOffsetX: 3,
        shadowOffsetY: 3,
        shadowBlur: 10,
        shadowColor: "rgba(0, 0, 0, 0.3)",
      },
    },
  };

  // Opções para o gráfico de linha
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#ffffff",
          font: {
            size: 12,
          },
          usePointStyle: true,
          pointStyle: "circle",
          padding: 12,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: R$ ${context.parsed.y.toFixed(
              2
            )}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#ffffff",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      y: {
        ticks: {
          color: "#ffffff",
          callback: (value) => `R$ ${value.toFixed(2)}`,
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Gráfico de Linha */}
      <div className="bg-gray-800/30 backdrop-blur-md p-6 rounded-lg shadow-lg w-full h-[350px]">
        <Line data={lineData} options={lineOptions} />
      </div>

      {/* Gráfico de Pizza */}
      <div className="bg-gray-800/30 backdrop-blur-md p-6 rounded-lg shadow-lg w-full h-[350px]">
        <Pie data={pieData} options={pieOptions} />
      </div>
    </div>
  );
}
