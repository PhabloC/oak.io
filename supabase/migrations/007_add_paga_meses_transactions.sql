-- Status de pagamento por mês para transações recorrentes (todos_meses)
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS paga_meses jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.transactions.paga_meses IS
  'Mapa de status pago por mês (chave em minúsculo, ex: janeiro=true) usado por transações recorrentes.';
