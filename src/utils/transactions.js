/**
 * Indica se a transação conta para o mês visualizado (lista / cards / gráficos).
 */
export function transactionMatchesMonth(transaction, monthName) {
  if (!transaction || !monthName) return false;
  if (transaction.todos_meses) return true;
  return transaction.month === monthName;
}

/** Encadeia filtro Supabase: mês igual ao selecionado OU marcada como todos os meses. */
export function applyMonthOrRecurringFilter(query, month) {
  return query.or(`month.eq.${month},todos_meses.eq.true`);
}
