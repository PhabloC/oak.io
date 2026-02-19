import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["#4CAF50", "#F44336", "#2196F3"];

export default function GraficoPizza({
  selectedMonth,
  transactions = [],
}) {
  const [viewMode, setViewMode] = useState("month"); // "month" ou "all"

  // Formatação customizada para tooltip
  const formatCurrency = (value) => `R$ ${value.toFixed(2)}`;

  // Dados para visualização por mês
  const getMonthData = () => {
    const ganhos = transactions
      .filter((t) => t.type === "Ganho" && t.month === selectedMonth)
      .reduce((acc, t) => acc + t.value, 0);

    const gastos = transactions
      .filter((t) => t.type === "Gasto" && t.month === selectedMonth)
      .reduce((acc, t) => acc + Math.abs(t.value), 0);

    const investimentos = transactions
      .filter((t) => t.type === "Investimento" && t.month === selectedMonth)
      .reduce((acc, t) => acc + Math.abs(t.value), 0);

    return [
      { name: "Ganhos", value: ganhos, color: COLORS[0] },
      { name: "Gastos", value: gastos, color: COLORS[1] },
      { name: "Investimentos", value: investimentos, color: COLORS[2] },
    ].filter((item) => item.value > 0); // Remove itens com valor zero
  };

  // Dados para visualização de todos os meses
  const getAllMonthsData = () => {
    const ganhos = transactions
      .filter((t) => t.type === "Ganho")
      .reduce((acc, t) => acc + t.value, 0);

    const gastos = transactions
      .filter((t) => t.type === "Gasto")
      .reduce((acc, t) => acc + Math.abs(t.value), 0);

    const investimentos = transactions
      .filter((t) => t.type === "Investimento")
      .reduce((acc, t) => acc + Math.abs(t.value), 0);

    return [
      { name: "Ganhos", value: ganhos, color: COLORS[0] },
      { name: "Gastos", value: gastos, color: COLORS[1] },
      { name: "Investimentos", value: investimentos, color: COLORS[2] },
    ].filter((item) => item.value > 0); // Remove itens com valor zero
  };

  const pieChartData =
    viewMode === "month" ? getMonthData() : getAllMonthsData();

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = pieChartData.reduce((sum, item) => sum + item.value, 0);
      const percentage =
        total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-gray-900/95 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold text-sm mb-1">{data.name}</p>
          <p className="text-white text-sm">
            {formatCurrency(data.value)} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Se não houver dados, mostra mensagem
  if (pieChartData.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-gray-800/40 via-gray-800/30 to-gray-800/40 backdrop-blur-md border-indigo-500/20 shadow-xl shadow-purple-500/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-lg font-semibold">
              Distribuição de Transações
            </CardTitle>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("month")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  viewMode === "month"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Mês
              </button>
              <button
                onClick={() => setViewMode("all")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  viewMode === "all"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Todos
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-center h-[320px]">
            <p className="text-gray-400 text-sm">
              Nenhuma transação encontrada
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-gray-800/40 via-gray-800/30 to-gray-800/40 backdrop-blur-md border-indigo-500/20 shadow-xl shadow-purple-500/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg font-semibold">
            {viewMode === "month"
              ? `Distribuição de ${selectedMonth}`
              : "Distribuição Geral"}
          </CardTitle>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                viewMode === "month"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setViewMode("all")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                viewMode === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Todos
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={pieChartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => {
                if (percent < 0.05) return ""; // Não mostra label se for muito pequeno
                return `${name}: ${(percent * 100).toFixed(0)}%`;
              }}
              outerRadius={110}
              fill="#8884d8"
              dataKey="value"
            >
              {pieChartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="#1f2937"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="square"
              iconSize={12}
              formatter={(value) => (
                <span className="text-gray-300 text-xs">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
