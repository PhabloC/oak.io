-- ============================================================
-- Security Migration: RLS Policies + CHECK Constraints + Triggers
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ============================================================
-- 1. ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.dividas ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 2. RLS POLICIES FOR "metas" TABLE
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'metas' AND policyname = 'Users can view own metas'
  ) THEN
    CREATE POLICY "Users can view own metas"
      ON public.metas FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'metas' AND policyname = 'Users can insert own metas'
  ) THEN
    CREATE POLICY "Users can insert own metas"
      ON public.metas FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'metas' AND policyname = 'Users can update own metas'
  ) THEN
    CREATE POLICY "Users can update own metas"
      ON public.metas FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'metas' AND policyname = 'Users can delete own metas'
  ) THEN
    CREATE POLICY "Users can delete own metas"
      ON public.metas FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;


-- ============================================================
-- 3. RLS POLICIES FOR "dividas" TABLE
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'dividas' AND policyname = 'Users can view own dividas'
  ) THEN
    CREATE POLICY "Users can view own dividas"
      ON public.dividas FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'dividas' AND policyname = 'Users can insert own dividas'
  ) THEN
    CREATE POLICY "Users can insert own dividas"
      ON public.dividas FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'dividas' AND policyname = 'Users can update own dividas'
  ) THEN
    CREATE POLICY "Users can update own dividas"
      ON public.dividas FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'dividas' AND policyname = 'Users can delete own dividas'
  ) THEN
    CREATE POLICY "Users can delete own dividas"
      ON public.dividas FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;


-- ============================================================
-- 4. CHECK CONSTRAINTS FOR "transactions"
-- ============================================================

ALTER TABLE public.transactions
  DROP CONSTRAINT IF EXISTS chk_transactions_title_length;
ALTER TABLE public.transactions
  ADD CONSTRAINT chk_transactions_title_length
  CHECK (char_length(title) <= 100);

ALTER TABLE public.transactions
  DROP CONSTRAINT IF EXISTS chk_transactions_description_length;
ALTER TABLE public.transactions
  ADD CONSTRAINT chk_transactions_description_length
  CHECK (description IS NULL OR char_length(description) <= 500);

ALTER TABLE public.transactions
  DROP CONSTRAINT IF EXISTS chk_transactions_value_range;
ALTER TABLE public.transactions
  ADD CONSTRAINT chk_transactions_value_range
  CHECK (value > 0 AND value <= 999999999.99);

ALTER TABLE public.transactions
  DROP CONSTRAINT IF EXISTS chk_transactions_date_range;
ALTER TABLE public.transactions
  ADD CONSTRAINT chk_transactions_date_range
  CHECK (date >= '2020-01-01' AND date <= CURRENT_DATE);


-- ============================================================
-- 5. CHECK CONSTRAINTS FOR "metas"
-- ============================================================

ALTER TABLE public.metas
  DROP CONSTRAINT IF EXISTS chk_metas_title_length;
ALTER TABLE public.metas
  ADD CONSTRAINT chk_metas_title_length
  CHECK (char_length(title) <= 100);

ALTER TABLE public.metas
  DROP CONSTRAINT IF EXISTS chk_metas_target_value_range;
ALTER TABLE public.metas
  ADD CONSTRAINT chk_metas_target_value_range
  CHECK (target_value > 0 AND target_value <= 999999999.99);

ALTER TABLE public.metas
  DROP CONSTRAINT IF EXISTS chk_metas_current_value_range;
ALTER TABLE public.metas
  ADD CONSTRAINT chk_metas_current_value_range
  CHECK (current_value >= 0 AND current_value <= 999999999.99);


-- ============================================================
-- 6. CHECK CONSTRAINTS FOR "dividas"
-- ============================================================

ALTER TABLE public.dividas
  DROP CONSTRAINT IF EXISTS chk_dividas_title_length;
ALTER TABLE public.dividas
  ADD CONSTRAINT chk_dividas_title_length
  CHECK (char_length(title) <= 100);

ALTER TABLE public.dividas
  DROP CONSTRAINT IF EXISTS chk_dividas_description_length;
ALTER TABLE public.dividas
  ADD CONSTRAINT chk_dividas_description_length
  CHECK (description IS NULL OR char_length(description) <= 500);

ALTER TABLE public.dividas
  DROP CONSTRAINT IF EXISTS chk_dividas_creditor_length;
ALTER TABLE public.dividas
  ADD CONSTRAINT chk_dividas_creditor_length
  CHECK (creditor IS NULL OR char_length(creditor) <= 100);

ALTER TABLE public.dividas
  DROP CONSTRAINT IF EXISTS chk_dividas_total_value_range;
ALTER TABLE public.dividas
  ADD CONSTRAINT chk_dividas_total_value_range
  CHECK (total_value > 0 AND total_value <= 999999999.99);

ALTER TABLE public.dividas
  DROP CONSTRAINT IF EXISTS chk_dividas_paid_value_range;
ALTER TABLE public.dividas
  ADD CONSTRAINT chk_dividas_paid_value_range
  CHECK (paid_value >= 0 AND paid_value <= 999999999.99);


-- ============================================================
-- 7. TRIGGERS: Prevent user_id manipulation
-- ============================================================

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

-- Transactions triggers
DROP TRIGGER IF EXISTS trg_transactions_enforce_user_id ON public.transactions;
CREATE TRIGGER trg_transactions_enforce_user_id
  BEFORE INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.enforce_user_id_on_insert();

DROP TRIGGER IF EXISTS trg_transactions_prevent_user_id_change ON public.transactions;
CREATE TRIGGER trg_transactions_prevent_user_id_change
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.prevent_user_id_update();

-- Metas triggers
DROP TRIGGER IF EXISTS trg_metas_enforce_user_id ON public.metas;
CREATE TRIGGER trg_metas_enforce_user_id
  BEFORE INSERT ON public.metas
  FOR EACH ROW EXECUTE FUNCTION public.enforce_user_id_on_insert();

DROP TRIGGER IF EXISTS trg_metas_prevent_user_id_change ON public.metas;
CREATE TRIGGER trg_metas_prevent_user_id_change
  BEFORE UPDATE ON public.metas
  FOR EACH ROW EXECUTE FUNCTION public.prevent_user_id_update();

-- Dividas triggers
DROP TRIGGER IF EXISTS trg_dividas_enforce_user_id ON public.dividas;
CREATE TRIGGER trg_dividas_enforce_user_id
  BEFORE INSERT ON public.dividas
  FOR EACH ROW EXECUTE FUNCTION public.enforce_user_id_on_insert();

DROP TRIGGER IF EXISTS trg_dividas_prevent_user_id_change ON public.dividas;
CREATE TRIGGER trg_dividas_prevent_user_id_change
  BEFORE UPDATE ON public.dividas
  FOR EACH ROW EXECUTE FUNCTION public.prevent_user_id_update();


-- ============================================================
-- 8. VERIFICATION QUERY (run to confirm everything is in place)
-- ============================================================

-- Check RLS status
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('transactions', 'metas', 'dividas');

-- Check policies
SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('transactions', 'metas', 'dividas')
ORDER BY tablename, policyname;
