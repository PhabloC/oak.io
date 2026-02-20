"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Line, LineChart, CartesianGrid, XAxis } from "recharts";
import { FaCalculator } from "react-icons/fa";

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

function calcularJurosCompostos(aporteMensal, taxaMensal, meses, valorInicial = 0) {
  const r = taxaMensal / 100;
  const projecao = [];
  let total = valorInicial;

  for (let i = 0; i <= meses; i++) {
    if (i > 0) {
      total = total * (1 + r) + aporteMensal;
    }
    projecao.push({
      mes: i,
      valor: total,
      label: i === 0 ? "Hoje" : `Mês ${i}`,
    });
  }
  return projecao;
}

export default function SimuladorJurosCompostos() {
  const [aporteMensal, setAporteMensal] = useState("500");
  const [taxaAnual, setTaxaAnual] = useState("12");
  const [tempoMeses, setTempoMeses] = useState("120");
  const [valorInicial, setValorInicial] = useState("0");

  const formatInputCurrency = (value) => {
    if (!value) return "";
    const n = value.replace(/\D/g, "");
    if (!n) return "";
    return (parseInt(n, 10) / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const parseNum = (v) => {
    if (!v) return 0;
    const c = String(v).replace(/\./g, "").replace(",", ".");
    return parseFloat(c) || 0;
  };

  const aporte = parseNum(aporteMensal);
  const taxaAnualNum = parseNum(taxaAnual);
  const meses = Math.min(600, Math.max(1, Math.floor(parseNum(tempoMeses))));
  const inicial = parseNum(valorInicial);

  const taxaMensal = useMemo(() => {
    if (taxaAnualNum <= 0) return 0;
    return Math.pow(1 + taxaAnualNum / 100, 1 / 12) - 1;
  }, [taxaAnualNum]);

  const projecao = useMemo(() => {
    return calcularJurosCompostos(aporte, taxaMensal * 100, meses, inicial);
  }, [aporte, taxaMensal, meses, inicial]);

  const valorFinal = projecao.length ? projecao[projecao.length - 1]?.valor : 0;
  const totalAportado = inicial + aporte * meses;
  const rendimento = valorFinal - totalAportado;

  const chartConfig = { valor: { label: "Patrimônio", color: "#22c55e" } };

  return (
    <Card className="border-indigo-500/20 bg-gradient-to-br from-gray-800/40 via-gray-800/30 to-gray-800/40 backdrop-blur-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FaCalculator className="text-indigo-400 text-xl" />
          <div>
            <CardTitle className="text-white">Simulador de juros compostos</CardTitle>
            <CardDescription className="text-gray-400">
              Projete seu patrimônio com aportes mensais
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Valor inicial (R$)
            </label>
            <input
              type="text"
              value={valorInicial}
              onChange={(e) => setValorInicial(formatInputCurrency(e.target.value))}
              className="w-full p-2 rounded-lg bg-gray-700/50 text-white border border-gray-600/50"
              placeholder="0,00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Aporte mensal (R$)
            </label>
            <input
              type="text"
              value={aporteMensal}
              onChange={(e) => setAporteMensal(formatInputCurrency(e.target.value))}
              className="w-full p-2 rounded-lg bg-gray-700/50 text-white border border-gray-600/50"
              placeholder="500,00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Taxa anual esperada (%)
            </label>
            <input
              type="text"
              value={taxaAnual}
              onChange={(e) => setTaxaAnual(e.target.value.replace(/\D/g, "").slice(0, 5))}
              className="w-full p-2 rounded-lg bg-gray-700/50 text-white border border-gray-600/50"
              placeholder="12"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Tempo (meses)
            </label>
            <input
              type="number"
              min="1"
              max="600"
              value={tempoMeses}
              onChange={(e) => setTempoMeses(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-700/50 text-white border border-gray-600/50"
              placeholder="120"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-gray-800/50">
          <div>
            <p className="text-gray-400 text-xs">Valor final</p>
            <p className="text-emerald-400 font-bold text-lg">
              {formatCurrency(valorFinal)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Total aportado</p>
            <p className="text-white font-semibold">{formatCurrency(totalAportado)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Rendimento</p>
            <p className={rendimento >= 0 ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
              {formatCurrency(rendimento)}
            </p>
          </div>
        </div>

        {projecao.length > 1 && (
          <ChartContainer config={chartConfig} className="h-[220px] w-full [&_.recharts-cartesian-axis-tick_text]:fill-gray-400">
            <LineChart data={projecao} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="mes"
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 10 }}
                tickFormatter={(v) => (v === 0 ? "0" : v % 12 === 0 ? `${v}m` : "")}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(v) => formatCurrency(v)}
                    labelFormatter={(_, p) => (p?.[0]?.payload?.label || "")}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="valor"
                stroke="var(--color-valor)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
