/**
 * Indica se a transação conta para o mês visualizado (lista / cards / gráficos).
 */
export function transactionMatchesMonth(transaction, monthName) {
  if (!transaction || !monthName) return false;
  if (transaction.todos_meses) {
    const monthKey = normalizeMonthKey(monthName);
    const excludedByMonth = getExcludedMonthsMap(transaction);
    return !Boolean(excludedByMonth[monthKey]);
  }
  return transaction.month === monthName;
}

/** Encadeia filtro Supabase: mês igual ao selecionado OU marcada como todos os meses. */
export function applyMonthOrRecurringFilter(query, month) {
  return query.or(`month.eq.${month},todos_meses.eq.true`);
}

function normalizeMonthKey(monthName) {
  return String(monthName || "").toLowerCase();
}

function getExcludedMonthsMap(transaction) {
  if (transaction?.excluido_meses && typeof transaction.excluido_meses === "object") {
    return transaction.excluido_meses;
  }
  return {};
}

export function getTransactionPaidStatus(transaction, monthName) {
  if (!transaction) return false;

  if (transaction.todos_meses) {
    const monthKey = normalizeMonthKey(monthName);
    const byMonth = transaction.paga_meses;
    if (monthKey && byMonth && Object.prototype.hasOwnProperty.call(byMonth, monthKey)) {
      return Boolean(byMonth[monthKey]);
    }
  }

  return Boolean(transaction.paga);
}

export function setRecurringMonthPaidStatus(transaction, monthName, paid) {
  const monthKey = normalizeMonthKey(monthName);
  const current = transaction?.paga_meses && typeof transaction.paga_meses === "object"
    ? transaction.paga_meses
    : {};

  if (!monthKey) return current;
  return { ...current, [monthKey]: Boolean(paid) };
}

export function setRecurringMonthExcludedStatus(transaction, monthName, excluded) {
  const monthKey = normalizeMonthKey(monthName);
  const current = getExcludedMonthsMap(transaction);

  if (!monthKey) return current;
  return { ...current, [monthKey]: Boolean(excluded) };
}
