-- Adiciona Tesouro Selic e taxa_selic_anual
ALTER TABLE public.ativos DROP CONSTRAINT IF EXISTS ativos_tipo_check;
ALTER TABLE public.ativos ADD CONSTRAINT ativos_tipo_check
  CHECK (tipo IN ('acoes', 'fiis', 'renda_fixa', 'tesouro_selic', 'exterior_cripto'));

ALTER TABLE public.ativos ADD COLUMN IF NOT EXISTS taxa_selic_anual NUMERIC;
