-- ============================================================
-- ideasprint 2026 Evaluation Dashboard
-- DB CLEANUP SCRIPT — Resets all event data for a fresh start
-- ⚠️  WARNING: This is IRREVERSIBLE. Run in Supabase SQL Editor.
-- ============================================================

-- 1. Delete all evaluation scores (child rows first due to FK constraints)
DELETE FROM public.evaluations;

-- 2. Reset all proposal grading state and lock state
UPDATE public.proposals
SET
  total_score = 0,
  is_graded   = false,
  locked_by   = NULL,
  locked_at   = NULL,
  assigned_to = NULL;

-- 3. (Optional) Delete all proposals entirely — uncomment if you want a full reset
-- DELETE FROM public.proposals;

-- 4. (Optional) Delete all evaluator accounts — uncomment if needed
-- NOTE: This deletes from profiles; auth.users rows must be deleted manually
--       in the Supabase Auth dashboard or via the admin API.
-- DELETE FROM public.profiles WHERE role = 'evaluator';

-- Verify cleanup
SELECT 'evaluations' AS table_name, COUNT(*) AS remaining FROM public.evaluations
UNION ALL
SELECT 'proposals (graded)', COUNT(*) FROM public.proposals WHERE is_graded = true
UNION ALL
SELECT 'proposals (assigned)', COUNT(*) FROM public.proposals WHERE assigned_to IS NOT NULL
UNION ALL
SELECT 'proposals (locked)', COUNT(*) FROM public.proposals WHERE locked_by IS NOT NULL;
