import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
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
  selectedMonth,
  transactions = [],
}) {
  const [viewMode, setViewMode] = useState("month"); // "month" ou "all"
  const [chartType, setChartType] = useState("bar"); // "bar", "line" ou "area"
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

      const receita = dayTransactions
        .filter((t) => t.type === "Ganho")
        .reduce((acc, t) => acc + t.value, 0);

      const despesa = dayTransactions
        .filter((t) => t.type === "Gasto")
        .reduce((acc, t) => acc + Math.abs(t.value), 0);

      return {
        label: day,
        Receita: receita,
        Despesa: despesa,
      };
    });
  };

  // Dados para visualização de todos os meses
  const getAllMonthsData = () => {
    return months.map((month) => {
      const monthTransactions = transactions.filter((t) => t.month === month);

      const receita = monthTransactions
        .filter((t) => t.type === "Ganho")
        .reduce((acc, t) => acc + t.value, 0);

      const despesa = monthTransactions
        .filter((t) => t.type === "Gasto")
        .reduce((acc, t) => acc + Math.abs(t.value), 0);

      return {
        label: month.substring(0, 3),
        fullMonth: month,
        Receita: receita,
        Despesa: despesa,
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

  const commonProps = {
    data: chartData,
    margin: { top: 10, right: 10, left: 0, bottom: 5 },
  };

  const renderChart = () => {
    const commonElements = (
      <>
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
          iconType={chartType === "bar" ? "square" : "line"}
          iconSize={12}
          formatter={(value) => (
            <span className="text-gray-300 text-xs">{value}</span>
          )}
        />
      </>
    );

    if (chartType === "bar") {
      return (
        <BarChart {...commonProps}>
          {commonElements}
          <Bar dataKey="Receita" fill="#10B981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Despesa" fill="#EF4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      );
    }

    if (chartType === "line") {
      return (
        <LineChart {...commonProps}>
          {commonElements}
          <Line
            type="monotone"
            dataKey="Receita"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "#10B981", strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="Despesa"
            stroke="#EF4444"
            strokeWidth={2}
            dot={{ fill: "#EF4444", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "#EF4444", strokeWidth: 2 }}
          />
        </LineChart>
      );
    }

    if (chartType === "area") {
      return (
        <AreaChart {...commonProps}>
          {commonElements}
          <Area
            type="monotone"
            dataKey="Receita"
            stroke="#10B981"
            fill="#10B981"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="Despesa"
            stroke="#EF4444"
            fill="#EF4444"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </AreaChart>
      );
    }
  };

  return (
    <Card className="bg-gradient-to-br from-gray-800/40 via-gray-800/30 to-gray-800/40 backdrop-blur-md border-indigo-500/20 shadow-xl shadow-purple-500/10">
      <CardHeader className="pb-3 px-3 sm:px-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="text-white text-base sm:text-lg font-semibold">
              {viewMode === "month"
                ? `Transações de ${selectedMonth}`
                : "Transações por Mês"}
            </CardTitle>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("month")}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-md transition-all ${
                  viewMode === "month"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Mês
              </button>
              <button
                onClick={() => setViewMode("all")}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-md transition-all ${
                  viewMode === "all"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Todos
              </button>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setChartType("bar")}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-md transition-all ${
                chartType === "bar"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Barras
            </button>
            <button
              onClick={() => setChartType("line")}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-md transition-all ${
                chartType === "line"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Linha
            </button>
            <button
              onClick={() => setChartType("area")}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-md transition-all ${
                chartType === "area"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Área
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-2 sm:px-6">
        <ResponsiveContainer width="100%" height={280} className="sm:!h-[320px]">
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
