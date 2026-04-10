export const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDateShort = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(Number(value) || 0);

const getMonthKey = (dateStr) => {
  const [year, month] = (dateStr || "").split("-");
  if (!year || !month) return null;
  return `${year}-${month}`;
};

const isNextMonth = (prevYear, prevMonth, year, month) => {
  if (year === prevYear && month === prevMonth + 1) return true;
  if (year === prevYear + 1 && prevMonth === 12 && month === 1) return true;
  return false;
};

export const getMaxConsecutivePositiveMonths = (transactions) => {
  const monthlyBalance = new Map();

  (transactions || []).forEach((tx) => {
    const amount = Math.abs(Number(tx.value) || 0);

    if (tx.todos_meses) {
      const [yearStr] = (tx.date || "").split("-");
      const year = parseInt(yearStr, 10);
      if (!year) return;
      for (let m = 1; m <= 12; m++) {
        const key = `${year}-${String(m).padStart(2, "0")}`;
        const current = monthlyBalance.get(key) || { receita: 0, despesa: 0 };
        if (tx.type === "Ganho") current.receita += amount;
        if (tx.type === "Gasto") current.despesa += amount;
        monthlyBalance.set(key, current);
      }
      return;
    }

    const key = getMonthKey(tx.date);
    if (!key) return;

    const current = monthlyBalance.get(key) || { receita: 0, despesa: 0 };

    if (tx.type === "Ganho") current.receita += amount;
    if (tx.type === "Gasto") current.despesa += amount;

    monthlyBalance.set(key, current);
  });

  const positiveMonths = [...monthlyBalance.entries()]
    .filter(([, b]) => b.receita - b.despesa > 0)
    .map(([key]) => key)
    .sort();

  if (positiveMonths.length === 0) return 0;

  let maxRun = 1;
  let currentRun = 1;

  for (let i = 1; i < positiveMonths.length; i++) {
    const [prevYear, prevMonth] = positiveMonths[i - 1].split("-").map(Number);
    const [year, month] = positiveMonths[i].split("-").map(Number);

    if (isNextMonth(prevYear, prevMonth, year, month)) {
      currentRun += 1;
      maxRun = Math.max(maxRun, currentRun);
    } else {
      currentRun = 1;
    }
  }

  return maxRun;
};

