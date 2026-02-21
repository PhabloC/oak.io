-- Coluna emergencia para marcar ativos que fazem parte da reserva de emergência
ALTER TABLE public.ativos ADD COLUMN IF NOT EXISTS emergencia BOOLEAN NOT NULL DEFAULT false;
