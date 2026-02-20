-- Migration: Add 'paga' column to transactions table
-- Description: Adds a boolean column to track if a transaction has been paid

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS paga BOOLEAN DEFAULT FALSE;
