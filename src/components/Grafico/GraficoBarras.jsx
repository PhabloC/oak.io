import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const getDaysInMonth = (month, year) => {
  const monthIndex = months.indexOf(month);
  return new Date(year, monthIndex + 1, 0).getDate();
};

export default function GraficoBarras({
  lineData,
  selectedMonth,
  transactions = [],
}) {
  const [viewMode, setViewMode] = useState("month"); // "month" ou "all"
  const year = new Date().getFullYear();

  // Formatação customizada para tooltip
  const formatCurrency = (value) => `R$ ${value.toFixed(2)}`;

  // Dados para visualização por mês (dias)
  const getMonthData = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, year);
    const labels = Array.from({ length: daysInMonth }, (_, i) =>
      (i + 1).toString()
    );

    return labels.map((day) => {
      const dayTransactions = transactions.filter(
        (t) =>
          t.month === selectedMonth &&
          t.date.endsWith(`-${day.padStart(2, "0")}`)
      );

      const ganhos = dayTransactions
        .filter((t) => t.type === "Ganho")
        .reduce((acc, t) => acc + t.value, 0);

      const gastos = dayTransactions
        .filter((t) => t.type === "Gasto")
        .reduce((acc, t) => acc + Math.abs(t.value), 0);

      const investimentos = dayTransactions
        .filter((t) => t.type === "Investimento")
        .reduce((acc, t) => acc + Math.abs(t.value), 0);

      return {
        label: day,
        Ganhos: ganhos,
        Gastos: gastos,
        Investimentos: investimentos,
      };
    });
  };

  // Dados para visualização de todos os meses
  const getAllMonthsData = () => {
    return months.map((month) => {
      const monthTransactions = transactions.filter((t) => t.month === month);

      const ganhos = monthTransactions
        .filter((t) => t.type === "Ganho")
        .reduce((acc, t) => acc + t.value, 0);

      const gastos = monthTransactions
        .filter((t) => t.type === "Gasto")
        .reduce((acc, t) => acc + Math.abs(t.value), 0);

      const investimentos = monthTransactions
        .filter((t) => t.type === "Investimento")
        .reduce((acc, t) => acc + Math.abs(t.value), 0);

      return {
        label: month.substring(0, 3), // Primeiras 3 letras do mês
        fullMonth: month,
        Ganhos: ganhos,
        Gastos: gastos,
        Investimentos: investimentos,
      };
    });
  };

  const chartData = viewMode === "month" ? getMonthData() : getAllMonthsData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const title =
        viewMode === "month"
          ? `Dia ${label} de ${selectedMonth}`
          : data.fullMonth || label;

      return (
        <div className="bg-gray-900/95 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold mb-2 text-sm">{title}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gradient-to-br from-gray-800/40 via-gray-800/30 to-gray-800/40 backdrop-blur-md border-indigo-500/20 shadow-xl shadow-purple-500/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg font-semibold">
            {viewMode === "month"
              ? `Transações de ${selectedMonth}`
              : "Transações por Mês"}
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
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 255, 255, 0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              stroke="#9ca3af"
              style={{ fontSize: "11px" }}
              tick={{ fill: "#9ca3af" }}
              axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: "11px" }}
              tick={{ fill: "#9ca3af" }}
              tickFormatter={(value) => {
                if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}k`;
                return formatCurrency(value);
              }}
              axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="square"
              iconSize={12}
              formatter={(value) => (
                <span className="text-gray-300 text-xs">{value}</span>
              )}
            />
            <Bar
              dataKey="Ganhos"
              stackId="a"
              fill="#4CAF50"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="Gastos"
              stackId="a"
              fill="#F44336"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="Investimentos"
              stackId="a"
              fill="#2196F3"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
