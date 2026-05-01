-- Permite excluir transação recorrente apenas em meses específicos
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS excluido_meses jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.transactions.excluido_meses IS
  'Mapa de meses excluídos para transações recorrentes (ex: maio=true oculta apenas no mês de maio).';
