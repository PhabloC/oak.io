"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
} from "recharts";
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

const MESES_COMPLETOS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const MESES_ABREV = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const mesToIndex = (mes) => {
  if (!mes) return 0;
  const m = String(mes);
  const idx = MESES_COMPLETOS.findIndex((nome) =>
    nome.toLowerCase().startsWith(m.toLowerCase().slice(0, 3))
  );
  return idx >= 0 ? idx : parseInt(m, 10) || 0;
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export default function GraficoEvolucaoMensal({
  patrimonioHistorico = [],
  periodoInicio,
  periodoFim,
}) {
  const chartData = useMemo(() => {
    if (!patrimonioHistorico?.length) return [];

    let filtered = [...patrimonioHistorico].sort((a, b) => {
      const vA = (a.ano || 0) * 12 + mesToIndex(a.mes);
      const vB = (b.ano || 0) * 12 + mesToIndex(b.mes);
      return vA - vB;
    });

    if (periodoInicio && periodoFim) {
      const partsIni = periodoInicio.split("-");
      const partsFim = periodoFim.split("-");
      const anoIni = parseInt(partsIni[0], 10) || 0;
      const mesIni = parseInt(partsIni[1], 10) || 1;
      const anoFim = parseInt(partsFim[0], 10) || 9999;
      const mesFim = parseInt(partsFim[1], 10) || 12;
      const vIni = anoIni * 12 + mesIni;
      const vFim = anoFim * 12 + mesFim;
      filtered = filtered.filter((p) => {
        const v = (p.ano || 0) * 12 + (mesToIndex(p.mes) + 1);
        return v >= vIni && v <= vFim;
      });
    }

    return filtered.map((p) => {
      const idx = mesToIndex(p.mes);
      return {
        label: `${MESES_ABREV[idx] || p.mes} ${p.ano}`,
        patrimonio: Number(p.total_patrimonio || 0),
      };
    });
  }, [patrimonioHistorico, periodoInicio, periodoFim]);

  const config = useMemo(
    () => ({
      patrimonio: { label: "Patrimônio", color: "#8b5cf6" },
    }),
    []
  );

  if (chartData.length === 0) {
    return (
      <Card className="border-indigo-500/20 bg-gradient-to-br from-gray-800/40 via-gray-800/30 to-gray-800/40 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white">Evolução mensal</CardTitle>
          <CardDescription className="text-gray-400">
            Registre snapshots do patrimônio para ver a evolução
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-gray-500 text-sm">
            Nenhum dado de evolução no período
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-indigo-500/20 bg-gradient-to-br from-gray-800/40 via-gray-800/30 to-gray-800/40 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-white">Evolução mensal</CardTitle>
        <CardDescription className="text-gray-400">
          Histórico do patrimônio ao longo do tempo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[260px] w-full [&_.recharts-cartesian-axis-tick_text]:fill-gray-400">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="label"
              tickLine={false}
              tick={{ fill: "#9ca3af" }}
              tickFormatter={(v) => (String(v).length > 8 ? String(v).slice(0, 7) + "…" : v)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(v) => formatCurrency(v)}
                />
              }
            />
            <Area
              dataKey="patrimonio"
              type="monotone"
              fill="var(--color-patrimonio)"
              fillOpacity={0.3}
              stroke="var(--color-patrimonio)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
