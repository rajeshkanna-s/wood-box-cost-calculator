-- ==============================================================================
-- SQL SCRIPT: Enable DELETE Permissions on Supabase Tables
-- Run this in your Supabase Project SQL Editor:
-- https://supabase.com/dashboard/project/datdsjjeuaqhowpkfdnt/sql
-- ==============================================================================

-- 1. Enable DELETE policy for companies
DROP POLICY IF EXISTS "Allow public delete on companies" ON public.companies;
CREATE POLICY "Allow public delete on companies" 
ON public.companies 
FOR DELETE 
USING (true);

-- 2. Enable DELETE policy for preset_sizes
DROP POLICY IF EXISTS "Allow public delete on preset_sizes" ON public.preset_sizes;
CREATE POLICY "Allow public delete on preset_sizes" 
ON public.preset_sizes 
FOR DELETE 
USING (true);

-- 3. Enable DELETE policy for calculations
DROP POLICY IF EXISTS "Allow public delete on calculations" ON public.calculations;
CREATE POLICY "Allow public delete on calculations" 
ON public.calculations 
FOR DELETE 
USING (true);

-- 4. Enable DELETE policy for specifications (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'specifications') THEN
    DROP POLICY IF EXISTS "Allow public delete on specifications" ON public.specifications;
    CREATE POLICY "Allow public delete on specifications" 
    ON public.specifications 
    FOR DELETE 
    USING (true);
  END IF;
END $$;

-- 5. Purge any soft-deleted records from previous sessions
DELETE FROM public.companies WHERE name ILIKE '__DELETED__%';
DELETE FROM public.preset_sizes WHERE label ILIKE '__DELETED__%';

-- Verification: Check all policies
SELECT tablename, policyname, cmd, permissive, roles 
FROM pg_policies 
WHERE schemaname = 'public';
