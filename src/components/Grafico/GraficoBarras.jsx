"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
} from "recharts";
import { FiDollarSign, FiTrendingDown, FiTrendingUp } from "react-icons/fi";
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

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

const chartConfig = {
  receita: {
    label: "Receita",
    color: "#22c55e",
    icon: FiTrendingUp,
  },
  despesa: {
    label: "Despesa",
    color: "#ef4444",
    icon: FiTrendingDown,
  },
  investimento: {
    label: "Investimento",
    color: "#3b82f6",
    icon: FiDollarSign,
  },
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);

export default function GraficoBarras({ selectedMonth, selectedYear, transactions = [] }) {
  const [viewMode, setViewMode] = useState("month");
  const [chartType, setChartType] = useState("bar"); // "bar" | "line" | "area"

  const year = selectedYear || new Date().getFullYear();

  const chartData =
    viewMode === "month"
      ? (() => {
          const daysInMonth = getDaysInMonth(selectedMonth, year);
          return Array.from({ length: daysInMonth }, (_, i) => {
            const day = (i + 1).toString();
            const dayTransactions = transactions.filter(
              (t) =>
                t.month === selectedMonth &&
                t.date?.endsWith(`-${day.padStart(2, "0")}`),
            );

            const receita = dayTransactions
              .filter((t) => t.type === "Ganho")
              .reduce((acc, t) => acc + t.value, 0);

            const despesa = dayTransactions
              .filter((t) => t.type === "Gasto")
              .reduce((acc, t) => acc + Math.abs(t.value), 0);

            const investimento = dayTransactions
              .filter((t) => t.type === "Investimento")
              .reduce((acc, t) => acc + Math.abs(t.value), 0);

            return {
              month: day,
              receita,
              despesa,
              investimento,
            };
          });
        })()
      : months.map((month) => {
          const monthTransactions = transactions.filter(
            (t) => t.month === month,
          );
          const receita = monthTransactions
            .filter((t) => t.type === "Ganho")
            .reduce((acc, t) => acc + t.value, 0);
          const despesa = monthTransactions
            .filter((t) => t.type === "Gasto")
            .reduce((acc, t) => acc + Math.abs(t.value), 0);
          const investimento = monthTransactions
            .filter((t) => t.type === "Investimento")
            .reduce((acc, t) => acc + Math.abs(t.value), 0);
          return {
            month: month.substring(0, 3),
            receita,
            despesa,
            investimento,
          };
        });

  const totalReceita = chartData.reduce((acc, d) => acc + d.receita, 0);
  const totalDespesa = chartData.reduce((acc, d) => acc + d.despesa, 0);
  const saldo = totalReceita - totalDespesa;
  const trendText =
    saldo >= 0
      ? `Saldo positivo de ${formatCurrency(saldo)} no período`
      : `Saldo negativo de ${formatCurrency(Math.abs(saldo))} no período`;

  return (
    <Card className="border-indigo-500/20 bg-gradient-to-br from-gray-800/40 via-gray-800/30 to-gray-800/40 shadow-xl shadow-purple-500/10 backdrop-blur-md">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-white">
              {viewMode === "month"
                ? `Transações de ${selectedMonth}`
                : "Transações por Mês"}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {viewMode === "month"
                ? `${selectedMonth} - ${year}`
                : `${year} - Receita vs Despesa`}
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
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setChartType("bar")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              chartType === "bar"
                ? "bg-emerald-600 text-white"
                : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
            }`}
          >
            Barras
          </button>
          <button
            onClick={() => setChartType("line")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              chartType === "line"
                ? "bg-emerald-600 text-white"
                : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
            }`}
          >
            Linha
          </button>
          <button
            onClick={() => setChartType("area")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              chartType === "area"
                ? "bg-emerald-600 text-white"
                : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
            }`}
          >
            Área
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[280px] w-full min-h-[250px] overflow-hidden sm:h-[320px] [&_.recharts-cartesian-axis-tick_text]:fill-gray-400"
        >
          {chartType === "bar" && (
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
              barCategoryGap="25%"
            >
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                tick={{ fill: "#9ca3af" }}
                tickFormatter={(value) => value}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatCurrency(value)}
                    hideLabel
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="receita"
                fill="var(--color-receita)"
                radius={[0, 0, 4, 4]}
                stackId="a"
              />
              <Bar
                dataKey="despesa"
                fill="var(--color-despesa)"
                radius={[0, 0, 0, 0]}
                stackId="a"
              />
              <Bar
                dataKey="investimento"
                fill="var(--color-investimento)"
                radius={[4, 4, 0, 0]}
                stackId="a"
              />
            </BarChart>
          )}
          {chartType === "line" && (
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="month"
                tickLine={false}
                tickMargin={8}
                tick={{ fill: "#9ca3af" }}
                tickFormatter={(value) =>
                  String(value).length >= 3 ? String(value).slice(0, 3) : value
                }
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatCurrency(value)}
                  />
                }
              />
              <Line
                dataKey="receita"
                type="monotone"
                stroke="var(--color-receita)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="despesa"
                type="monotone"
                stroke="var(--color-despesa)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="investimento"
                type="monotone"
                stroke="var(--color-investimento)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          )}
          {chartType === "area" && (
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 12, right: 12 }}
              style={{ overflow: "hidden" }}
            >
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="month"
                tickLine={false}
                tickMargin={8}
                tick={{ fill: "#9ca3af" }}
                tickFormatter={(value) =>
                  String(value).length >= 3 ? String(value).slice(0, 3) : value
                }
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatCurrency(value)}
                    indicator="line"
                  />
                }
              />
              <Area
                dataKey="despesa"
                fill="var(--color-despesa)"
                fillOpacity={0.4}
                stackId="a"
                stroke="var(--color-despesa)"
                type="natural"
              />
              <Area
                dataKey="receita"
                fill="var(--color-receita)"
                fillOpacity={0.4}
                stackId="a"
                stroke="var(--color-receita)"
                type="natural"
              />
              <Area
                dataKey="investimento"
                fill="var(--color-investimento)"
                fillOpacity={0.4}
                stackId="a"
                stroke="var(--color-investimento)"
                type="natural"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          )}
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex w-full flex-col gap-2">
          <div className="flex items-center gap-2 font-medium leading-none text-indigo-300">
            {saldo >= 0 ? (
              <FiTrendingUp className="h-4 w-4" />
            ) : (
              <FiTrendingDown className="h-4 w-4" />
            )}
            {trendText}
          </div>
          <div className="flex items-center gap-2 leading-none text-gray-500">
            {viewMode === "month"
              ? `${selectedMonth} - ${year}`
              : `Janeiro - Dezembro ${year}`}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
