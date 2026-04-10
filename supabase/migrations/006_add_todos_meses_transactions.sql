-- Transações que se repetem em todos os meses do ano (mesmo valor/comportamento)
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS todos_meses boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.transactions.todos_meses IS
  'Quando true, a transação entra nos totais e listas de qualquer mês do ano da data.';
