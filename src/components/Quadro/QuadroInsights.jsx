import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTransactions } from "../../context/TransactionsContext";
import {
  getTransactionPaidStatus,
  transactionMatchesMonth,
} from "../../utils/transactions";

const MONTHS = [
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

function prevCalendarMonth(monthName, year) {
  const idx = MONTHS.indexOf(monthName);
  if (idx < 0) return { month: monthName, year };
  if (idx === 0) return { month: MONTHS[11], year: year - 1 };
  return { month: MONTHS[idx - 1], year };
}

function belongsToCalendarMonth(transaction, year, monthName) {
  if (!transaction?.date) return false;
  const monthNum = MONTHS.indexOf(monthName) + 1;
  if (monthNum < 1) return false;
  if (transaction.todos_meses) {
    const ty = parseInt(transaction.date.split("-")[0], 10);
    return ty === year;
  }
  const parts = transaction.date.split("-");
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  return y === year && m === monthNum;
}

const formatBRL = (n) =>
  `R$ ${Math.abs(Number(n) || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function QuadroInsights({ selectedMonth, selectedYear }) {
  const year = selectedYear ?? new Date().getFullYear();
  const { transactions } = useTransactions();
  const navigate = useNavigate();

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((transaction) =>
        transactionMatchesMonth(transaction, selectedMonth),
      ),
    [transactions, selectedMonth],
  );

  const topGastoCategories = useMemo(() => {
    const map = new Map();
    for (const t of filteredTransactions) {
      if (t.type !== "Gasto") continue;
      const cat = (t.category && String(t.category).trim()) || "Sem categoria";
      const v = Math.abs(Number(t.value) || 0);
      map.set(cat, (map.get(cat) || 0) + v);
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [filteredTransactions]);

  const emAberto = useMemo(() => {
    return filteredTransactions.filter(
      (t) =>
        (t.type === "Gasto" || t.type === "Investimento") &&
        !getTransactionPaidStatus(t, selectedMonth),
    );
  }, [filteredTransactions, selectedMonth]);

  const comparativoGastos = useMemo(() => {
    const gastosAtual = filteredTransactions
      .filter((t) => t.type === "Gasto")
      .reduce((acc, t) => acc + Math.abs(Number(t.value) || 0), 0);

    const { month: prevMonth, year: prevYear } = prevCalendarMonth(
      selectedMonth,
      year,
    );

    if (prevYear !== year) {
      return {
        kind: "cross_year",
        gastosAtual,
        prevMonth,
        prevYear,
      };
    }

    const gastosAnterior = transactions
      .filter(
        (t) =>
          t.type === "Gasto" && belongsToCalendarMonth(t, prevYear, prevMonth),
      )
      .reduce((acc, t) => acc + Math.abs(Number(t.value) || 0), 0);

    const diff = gastosAtual - gastosAnterior;
    let pct = 0;
    if (gastosAnterior > 0) {
      pct = (diff / gastosAnterior) * 100;
    } else if (gastosAtual > 0) {
      pct = 100;
    }

    return {
      kind: "ok",
      gastosAtual,
      gastosAnterior,
      prevMonth,
      pct,
    };
  }, [filteredTransactions, transactions, selectedMonth, year]);

  const cardClass =
    "bg-gradient-to-br from-gray-800/40 via-gray-800/30 to-gray-800/40 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-xl shadow-purple-500/10 w-full lg:w-[350px] xl:w-[400px] border border-indigo-500/20";

  return (
    <div
      className={`${cardClass} flex flex-col gap-5 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20`}
    >
      <section>
        <h4 className="text-sm font-semibold text-indigo-200 mb-3">
          Top 3 categorias de gasto
        </h4>
        {topGastoCategories.length === 0 ? (
          <p className="text-xs text-gray-500 leading-relaxed">
            Nenhum gasto neste mês para agrupar por categoria.
          </p>
        ) : (
          <ol className="space-y-2">
            {topGastoCategories.map(([cat, total], i) => (
              <li
                key={cat}
                className="flex items-center justify-between gap-2 rounded-lg bg-gray-800/30 border border-gray-700/30 px-3 py-2"
              >
                <span className="text-xs text-gray-400 font-medium w-5 shrink-0">
                  {i + 1}.
                </span>
                <span className="text-sm text-white truncate flex-1">{cat}</span>
                <span className="text-sm font-semibold text-red-300 shrink-0">
                  {formatBRL(total)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="pt-5 border-t border-gray-700/50">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h4 className="text-sm font-semibold text-indigo-200">
            Em aberto (a pagar)
          </h4>
          {emAberto.length > 0 && (
            <button
              type="button"
              onClick={() => navigate("/transacoes")}
              className="text-[11px] text-indigo-300 hover:text-indigo-200 underline-offset-2 hover:underline"
            >
              Ver em Transações
            </button>
          )}
        </div>
        {emAberto.length === 0 ? (
          <p className="text-xs text-gray-500 leading-relaxed">
            Nenhum gasto ou investimento em aberto neste mês.
          </p>
        ) : (
          <ul className="space-y-2">
            {emAberto.slice(0, 5).map((t) => (
              <li
                key={t.id}
                className="flex justify-between items-center gap-2 rounded-lg bg-gray-800/30 border border-amber-500/20 px-3 py-2"
              >
                <span className="text-sm text-white truncate flex-1">
                  {t.title}
                </span>
                <span
                  className={`text-sm font-semibold shrink-0 ${
                    t.type === "Gasto" ? "text-red-300" : "text-blue-300"
                  }`}
                >
                  {formatBRL(t.value)}
                </span>
              </li>
            ))}
            {emAberto.length > 5 && (
              <p className="text-[11px] text-gray-500 pt-1">
                +{emAberto.length - 5} outra(s) — abra Transações para ver tudo.
              </p>
            )}
          </ul>
        )}
      </section>

      <section className="pt-5 border-t border-gray-700/50">
        <h4 className="text-sm font-semibold text-indigo-200 mb-3">
          Gastos vs. mês anterior
        </h4>
        {comparativoGastos.kind === "cross_year" ? (
          <p className="text-xs text-gray-400 leading-relaxed">
            Para comparar <span className="text-gray-300">{selectedMonth}</span>{" "}
            com <span className="text-gray-300">{comparativoGastos.prevMonth}</span>, selecione o
            ano <span className="text-indigo-300">{comparativoGastos.prevYear}</span> no topo do
            dashboard (os dados desse ano precisam estar carregados).
          </p>
        ) : comparativoGastos.gastosAnterior === 0 &&
          comparativoGastos.gastosAtual === 0 ? (
          <p className="text-xs text-gray-500 leading-relaxed">
            Sem gastos registrados neste mês nem em{" "}
            <span className="text-gray-400">{comparativoGastos.prevMonth}</span>.
          </p>
        ) : comparativoGastos.gastosAnterior === 0 &&
          comparativoGastos.gastosAtual > 0 ? (
          <p className="text-xs text-gray-400 leading-relaxed">
            Gastos atuais:{" "}
            <span className="text-white font-medium">
              {formatBRL(comparativoGastos.gastosAtual)}
            </span>
            . Em {comparativoGastos.prevMonth} não houve gastos registrados.
          </p>
        ) : (
          <p className="text-xs text-gray-400 leading-relaxed">
            Em {comparativoGastos.prevMonth}:{" "}
            <span className="text-gray-300">
              {formatBRL(comparativoGastos.gastosAnterior)}
            </span>
            . Agora:{" "}
            <span className="text-white font-medium">
              {formatBRL(comparativoGastos.gastosAtual)}
            </span>
            <span className="block mt-2">
              {comparativoGastos.pct > 0 ? (
                <>
                  <span className="text-amber-300 font-medium">
                    {Math.abs(comparativoGastos.pct).toFixed(0)}% acima
                  </span>{" "}
                  do mês anterior.
                </>
              ) : comparativoGastos.pct < 0 ? (
                <>
                  <span className="text-emerald-300 font-medium">
                    {Math.abs(comparativoGastos.pct).toFixed(0)}% abaixo
                  </span>{" "}
                  do mês anterior.
                </>
              ) : (
                <>Igual ao mês anterior em valor total.</>
              )}
            </span>
          </p>
        )}
      </section>
    </div>
  );
}
