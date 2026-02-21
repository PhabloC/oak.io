-- ============================================================
-- Tabelas para o módulo de Investimentos
-- ============================================================

-- Funções necessárias (caso a migration 001 não tenha sido executada)
CREATE OR REPLACE FUNCTION public.enforce_user_id_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'user_id must match the authenticated user';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_user_id_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Changing user_id is not allowed';
  END IF;
  RETURN NEW;
END;
$$;

-- Tabela de ativos (investimentos do usuário)
CREATE TABLE IF NOT EXISTS public.ativos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('acoes', 'fiis', 'renda_fixa', 'exterior_cripto')),
  valor_atual NUMERIC NOT NULL DEFAULT 0,
  valor_investido NUMERIC NOT NULL DEFAULT 0,
  quantidade NUMERIC DEFAULT 1,
  ticker TEXT,
  data_compra DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de histórico de evolução patrimonial (snapshots mensais)
CREATE TABLE IF NOT EXISTS public.patrimonio_historico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_patrimonio NUMERIC NOT NULL,
  mes TEXT NOT NULL,
  ano INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, mes, ano)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ativos_user_id ON public.ativos(user_id);
CREATE INDEX IF NOT EXISTS idx_ativos_tipo ON public.ativos(user_id, tipo);
CREATE INDEX IF NOT EXISTS idx_patrimonio_historico_user ON public.patrimonio_historico(user_id);
CREATE INDEX IF NOT EXISTS idx_patrimonio_historico_mes_ano ON public.patrimonio_historico(user_id, ano, mes);

-- RLS
ALTER TABLE public.ativos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patrimonio_historico ENABLE ROW LEVEL SECURITY;

-- Políticas para ativos
DROP POLICY IF EXISTS "Users can view own ativos" ON public.ativos;
CREATE POLICY "Users can view own ativos" ON public.ativos FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own ativos" ON public.ativos;
CREATE POLICY "Users can insert own ativos" ON public.ativos FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own ativos" ON public.ativos;
CREATE POLICY "Users can update own ativos" ON public.ativos FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own ativos" ON public.ativos;
CREATE POLICY "Users can delete own ativos" ON public.ativos FOR DELETE USING (auth.uid() = user_id);

-- Políticas para patrimonio_historico
DROP POLICY IF EXISTS "Users can view own patrimonio" ON public.patrimonio_historico;
CREATE POLICY "Users can view own patrimonio" ON public.patrimonio_historico FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own patrimonio" ON public.patrimonio_historico;
CREATE POLICY "Users can insert own patrimonio" ON public.patrimonio_historico FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own patrimonio" ON public.patrimonio_historico;
CREATE POLICY "Users can update own patrimonio" ON public.patrimonio_historico FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own patrimonio" ON public.patrimonio_historico;
CREATE POLICY "Users can delete own patrimonio" ON public.patrimonio_historico FOR DELETE USING (auth.uid() = user_id);

-- Triggers para ativos
DROP TRIGGER IF EXISTS trg_ativos_enforce_user_id ON public.ativos;
CREATE TRIGGER trg_ativos_enforce_user_id BEFORE INSERT ON public.ativos
  FOR EACH ROW EXECUTE FUNCTION public.enforce_user_id_on_insert();

DROP TRIGGER IF EXISTS trg_ativos_prevent_user_id_change ON public.ativos;
CREATE TRIGGER trg_ativos_prevent_user_id_change BEFORE UPDATE ON public.ativos
  FOR EACH ROW EXECUTE FUNCTION public.prevent_user_id_update();

-- Triggers para patrimonio_historico
DROP TRIGGER IF EXISTS trg_patrimonio_enforce_user_id ON public.patrimonio_historico;
CREATE TRIGGER trg_patrimonio_enforce_user_id BEFORE INSERT ON public.patrimonio_historico
  FOR EACH ROW EXECUTE FUNCTION public.enforce_user_id_on_insert();

DROP TRIGGER IF EXISTS trg_patrimonio_prevent_user_id_change ON public.patrimonio_historico;
CREATE TRIGGER trg_patrimonio_prevent_user_id_change BEFORE UPDATE ON public.patrimonio_historico
  FOR EACH ROW EXECUTE FUNCTION public.prevent_user_id_update();
