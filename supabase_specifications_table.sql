-- =============================================================================
-- OPTIONAL DEDICATED SPECIFICATIONS TABLE SCHEMA
-- Run this in your Supabase SQL Editor if you wish to maintain a separate
-- normalized table for specifications in addition to the calculations table.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.specifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  preset_size_id UUID REFERENCES public.preset_sizes(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL DEFAULT 'pine-wood-box',
  part_id TEXT NOT NULL,
  label TEXT NOT NULL,
  l NUMERIC NOT NULL DEFAULT 0,
  w NUMERIC NOT NULL DEFAULT 0,
  h NUMERIC NOT NULL DEFAULT 0,
  qty NUMERIC NOT NULL DEFAULT 1,
  is_ply BOOLEAN NOT NULL DEFAULT FALSE,
  is_custom BOOLEAN NOT NULL DEFAULT FALSE,
  is_excluded BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.specifications ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous access (matching your current companies and preset_sizes configuration)
CREATE POLICY "Allow public read specifications"
  ON public.specifications FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert specifications"
  ON public.specifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update specifications"
  ON public.specifications FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete specifications"
  ON public.specifications FOR DELETE
  USING (true);

-- Helpful indices for fast lookups
CREATE INDEX IF NOT EXISTS idx_specifications_company_preset 
  ON public.specifications(company_id, preset_size_id, product_type);
