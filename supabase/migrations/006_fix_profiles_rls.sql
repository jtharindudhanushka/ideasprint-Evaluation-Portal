-- ============================================================
-- ideasprint 2026 Evaluation Dashboard
-- Migration 006: Fix evaluator profile visibility
-- Run this in the Supabase SQL Editor.
-- ============================================================

-- Problem: Evaluators could only SELECT their own profile row.
-- This caused "Unassigned" to show in the dashboard for proposals
-- assigned to other evaluators because the assignee's name could
-- not be fetched from the profiles table.
--
-- Fix: Allow all authenticated evaluators to read all profile rows.
-- profiles only contains full_name and role — not sensitive data.

DROP POLICY IF EXISTS "evaluator_profiles_select" ON public.profiles;

CREATE POLICY "evaluator_profiles_select"
  ON public.profiles FOR SELECT TO authenticated
  USING ((SELECT public.get_user_role()) IN ('admin', 'evaluator'));
