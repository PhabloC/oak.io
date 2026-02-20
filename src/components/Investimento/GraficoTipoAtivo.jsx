"use client";

import { useMemo } from "react";
import { Pie, PieChart } from "recharts";
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

const TIPO_LABELS = {
  acoes: "Ações",
  fiis: "FIIs",
  tesouro_selic: "Tesouro Selic",
  acoes_exterior: "Ações Exterior",
  etf_exterior: "ETF Exterior",
  cripto: "Criptomoedas",
};

const TIPO_COLORS = {
  acoes: "#3b82f6",
  fiis: "#22c55e",
  tesouro_selic: "#eab308",
  acoes_exterior: "#a855f7",
  etf_exterior: "#ec4899",
  cripto: "#f97316",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);

export default function GraficoTipoAtivo({ ativos = [] }) {
  const chartData = useMemo(() => {
    const byTipo = ativos.reduce((acc, a) => {
      acc[a.tipo] = (acc[a.tipo] || 0) + Number(a.valor_atual || 0);
      return acc;
    }, {});

    return Object.entries(byTipo).map(([tipo, value]) => ({
      tipo,
      label: TIPO_LABELS[tipo] || tipo,
      value,
      fill: TIPO_COLORS[tipo] || "#6b7280",
    }));
  }, [ativos]);

  const total = chartData.reduce((s, d) => s + d.value, 0);

  if (chartData.length === 0) {
    return (
      <Card className="border-indigo-500/20 bg-gradient-to-br from-gray-800/40 via-gray-800/30 to-gray-800/40 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white">Por tipo de ativo</CardTitle>
          <CardDescription className="text-gray-400">
            Adicione ativos para visualizar a distribuição
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-gray-500 text-sm">Nenhum ativo cadastrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-indigo-500/20 bg-gradient-to-br from-gray-800/40 via-gray-800/30 to-gray-800/40 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-white">Por tipo de ativo</CardTitle>
        <CardDescription className="text-gray-400">
          Total: {formatCurrency(total)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={Object.fromEntries(
            Object.entries(TIPO_LABELS).map(([k, v]) => [
              k,
              { label: v, color: TIPO_COLORS[k] },
            ])
          )}
          className="mx-auto aspect-square max-h-[220px] [&_.recharts-pie-label-text]:fill-white"
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value) => formatCurrency(value)}
                  nameKey="tipo"
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="value"
              label={({ tipo, percent }) =>
                percent >= 0.05
                  ? `${TIPO_LABELS[tipo] || tipo}: ${(percent * 100).toFixed(0)}%`
                  : ""
              }
              nameKey="tipo"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
