"use client";

import { useState, useMemo } from "react";
import { Pie, PieChart } from "recharts";
import { FiTrendingUp } from "react-icons/fi";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  value: {
    label: "Valor",
  },
  ganhos: {
    label: "Ganhos",
    color: "#22c55e",
  },
  gastos: {
    label: "Gastos",
    color: "#ef4444",
  },
  investimentos: {
    label: "Investimentos",
    color: "#3b82f6",
  },
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);

export default function GraficoPizza({
  selectedMonth,
  selectedYear,
  transactions = [],
}) {
  const [viewMode, setViewMode] = useState("month"); // "month" ou "all"
  const year = selectedYear || new Date().getFullYear();

  const chartData = useMemo(() => {
    const filterByMonth = (t) => t.month === selectedMonth;

    const ganhos = transactions
      .filter((t) => t.type === "Ganho" && (viewMode === "all" || filterByMonth(t)))
      .reduce((acc, t) => acc + t.value, 0);

    const gastos = transactions
      .filter((t) => t.type === "Gasto" && (viewMode === "all" || filterByMonth(t)))
      .reduce((acc, t) => acc + Math.abs(t.value), 0);

    const investimentos = transactions
      .filter(
        (t) =>
          t.type === "Investimento" && (viewMode === "all" || filterByMonth(t))
      )
      .reduce((acc, t) => acc + Math.abs(t.value), 0);

    return [
      { category: "ganhos", value: ganhos, fill: "var(--color-ganhos)" },
      { category: "gastos", value: gastos, fill: "var(--color-gastos)" },
      {
        category: "investimentos",
        value: investimentos,
        fill: "var(--color-investimentos)",
      },
    ].filter((item) => item.value > 0);
  }, [transactions, selectedMonth, viewMode]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const hasGanhos = chartData.some((d) => d.category === "ganhos");
  const trendText =
    hasGanhos && total > 0
      ? `Total de ${formatCurrency(total)} no período`
      : "Adicione transações para ver a distribuição";

  if (chartData.length === 0) {
    return (
      <Card className="flex flex-col border-indigo-500/20 bg-gradient-to-br from-gray-800/40 via-gray-800/30 to-gray-800/40 shadow-xl shadow-purple-500/10 backdrop-blur-md">
        <CardHeader className="items-center pb-0">
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-white">
                Distribuição de Transações
              </CardTitle>
              <CardDescription className="text-gray-400">
                {viewMode === "month"
                  ? selectedMonth
                  : "Todos os meses"}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("month")}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  viewMode === "month"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Mês
              </button>
              <button
                onClick={() => setViewMode("all")}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
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
        <CardContent className="flex flex-1 items-center justify-center py-12">
          <p className="text-gray-400 text-sm">
            Nenhuma transação encontrada
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col border-indigo-500/20 bg-gradient-to-br from-gray-800/40 via-gray-800/30 to-gray-800/40 shadow-xl shadow-purple-500/10 backdrop-blur-md">
      <CardHeader className="items-center pb-0">
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-white">
              {viewMode === "month"
                ? `Distribuição de ${selectedMonth}`
                : "Distribuição Geral"}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {viewMode === "month"
                ? `${selectedMonth} - ${year}`
                : `Total geral - ${year}`}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("month")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                viewMode === "month"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setViewMode("all")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
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
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-white"
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value) => formatCurrency(value)}
                  nameKey="category"
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="value"
              label={({ category, percent }) =>
                percent >= 0.05
                  ? `${chartConfig[category]?.label ?? category}: ${(percent * 100).toFixed(0)}%`
                  : ""
              }
              nameKey="category"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none text-indigo-300">
          <FiTrendingUp className="h-4 w-4" />
          {trendText}
        </div>
        <div className="leading-none text-gray-500">
          {viewMode === "month"
            ? `Mostrando transações de ${selectedMonth}`
            : "Mostrando total de todas as transações"}
        </div>
      </CardFooter>
    </Card>
  );
}
