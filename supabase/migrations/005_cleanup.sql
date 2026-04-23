-- ============================================================
-- ideasprint 2026 Evaluation Dashboard
-- DB CLEANUP SCRIPT — Full reset for a fresh start
-- ⚠️  WARNING: This is IRREVERSIBLE. Run in Supabase SQL Editor.
-- ============================================================

-- 1. Delete all evaluation scores first (child rows, FK constraint)
DELETE FROM public.evaluations;

-- 2. Delete all proposals (cascade will also clean evaluations if any remain)
DELETE FROM public.proposals;

-- 3. (Optional) Delete all evaluator accounts from profiles
--    NOTE: Auth users must be deleted separately in Supabase Auth dashboard
-- DELETE FROM public.profiles WHERE role = 'evaluator';

-- Verify — all counts should be 0
SELECT 'evaluations' AS table_name, COUNT(*) AS remaining FROM public.evaluations
UNION ALL
SELECT 'proposals', COUNT(*) FROM public.proposals;
