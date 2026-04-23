-- ============================================================
-- ideasprint 2026 Evaluation Dashboard
-- Migration 002: Row-Level Security Policies
-- Run this AFTER 001_schema.sql in the Supabase SQL Editor.
-- ============================================================

-- ============================================================
-- PROFILES
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Admins: full access
CREATE POLICY "admin_profiles_all"
  ON public.profiles FOR ALL TO authenticated
  USING  ((SELECT public.get_user_role()) = 'admin')
  WITH CHECK ((SELECT public.get_user_role()) = 'admin');

-- Evaluators: read own profile
CREATE POLICY "evaluator_profiles_select"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

-- Evaluators: update own profile (name only)
CREATE POLICY "evaluator_profiles_update"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================
-- RUBRIC SECTIONS
-- ============================================================
ALTER TABLE public.rubric_sections ENABLE ROW LEVEL SECURITY;

-- Admins: full access
CREATE POLICY "admin_rubric_sections_all"
  ON public.rubric_sections FOR ALL TO authenticated
  USING  ((SELECT public.get_user_role()) = 'admin')
  WITH CHECK ((SELECT public.get_user_role()) = 'admin');

-- Evaluators: read only
CREATE POLICY "evaluator_rubric_sections_select"
  ON public.rubric_sections FOR SELECT TO authenticated
  USING ((SELECT public.get_user_role()) = 'evaluator');

-- ============================================================
-- RUBRIC CRITERIA
-- ============================================================
ALTER TABLE public.rubric_criteria ENABLE ROW LEVEL SECURITY;

-- Admins: full access
CREATE POLICY "admin_rubric_criteria_all"
  ON public.rubric_criteria FOR ALL TO authenticated
  USING  ((SELECT public.get_user_role()) = 'admin')
  WITH CHECK ((SELECT public.get_user_role()) = 'admin');

-- Evaluators: read only
CREATE POLICY "evaluator_rubric_criteria_select"
  ON public.rubric_criteria FOR SELECT TO authenticated
  USING ((SELECT public.get_user_role()) = 'evaluator');

-- ============================================================
-- PROPOSALS
-- ============================================================
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Admins: full access
CREATE POLICY "admin_proposals_all"
  ON public.proposals FOR ALL TO authenticated
  USING  ((SELECT public.get_user_role()) = 'admin')
  WITH CHECK ((SELECT public.get_user_role()) = 'admin');

-- Evaluators: read all proposals
CREATE POLICY "evaluator_proposals_select"
  ON public.proposals FOR SELECT TO authenticated
  USING ((SELECT public.get_user_role()) = 'evaluator');

-- Evaluators: update lock fields and score on proposals
CREATE POLICY "evaluator_proposals_update"
  ON public.proposals FOR UPDATE TO authenticated
  USING ((SELECT public.get_user_role()) = 'evaluator')
  WITH CHECK ((SELECT public.get_user_role()) = 'evaluator');

-- ============================================================
-- EVALUATIONS
-- ============================================================
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- Admins: full access
CREATE POLICY "admin_evaluations_all"
  ON public.evaluations FOR ALL TO authenticated
  USING  ((SELECT public.get_user_role()) = 'admin')
  WITH CHECK ((SELECT public.get_user_role()) = 'admin');

-- Evaluators: read own evaluations
CREATE POLICY "evaluator_evaluations_select"
  ON public.evaluations FOR SELECT TO authenticated
  USING (evaluator_id = auth.uid());

-- Evaluators: insert own evaluations
CREATE POLICY "evaluator_evaluations_insert"
  ON public.evaluations FOR INSERT TO authenticated
  WITH CHECK (
    evaluator_id = auth.uid()
    AND (SELECT public.get_user_role()) = 'evaluator'
  );

-- Evaluators: update own evaluations
CREATE POLICY "evaluator_evaluations_update"
  ON public.evaluations FOR UPDATE TO authenticated
  USING (evaluator_id = auth.uid())
  WITH CHECK (evaluator_id = auth.uid());
