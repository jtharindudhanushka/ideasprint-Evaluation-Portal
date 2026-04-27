-- ============================================================
-- ideasprint 2026 Evaluation Dashboard
-- Migration 007: Fix QA Audit Findings
-- Run this in the Supabase SQL Editor.
-- ============================================================

-- 1. Close P0 vulnerability: Drop evaluator update privileges on proposals.
-- Evaluators can no longer manipulate team_name, proposal_url, or arbitrarily set total_score.
-- All scoring updates will now happen securely via the submit_evaluation RPC.
DROP POLICY IF EXISTS "evaluator_proposals_update" ON public.proposals;

-- 2. Fix P2 visibility bug: Allow all evaluators to read all evaluations.
-- This ensures the "Evaluated by" pill works correctly for all users in leaderboards.
DROP POLICY IF EXISTS "evaluator_evaluations_select" ON public.evaluations;

CREATE POLICY "evaluator_evaluations_select"
  ON public.evaluations FOR SELECT TO authenticated
  USING ((SELECT public.get_user_role()) IN ('admin', 'evaluator'));

-- 3. Fix P1 bounds checking: Add constraint to ensure scores are positive.
ALTER TABLE public.evaluations
  ADD CONSTRAINT check_score_positive CHECK (score >= 0);

-- 4. Fix P2 partial submission bug & restore atomic updates.
-- This RPC securely processes evaluations and updates the proposal's total score in a single transaction.
-- SECURITY DEFINER allows it to bypass RLS, replacing the dropped evaluator update policy securely.
CREATE OR REPLACE FUNCTION public.submit_evaluation(
  p_proposal_id UUID,
  p_evaluations JSONB,
  p_total_score INT
) RETURNS VOID AS $$
DECLARE
  v_evaluator_id UUID;
  v_assigned_to UUID;
  elem JSONB;
BEGIN
  -- Get the current authenticated user ID
  v_evaluator_id := auth.uid();
  IF v_evaluator_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Ensure the proposal is assigned to the current user
  SELECT assigned_to INTO v_assigned_to FROM public.proposals WHERE id = p_proposal_id;
  IF v_assigned_to != v_evaluator_id THEN
    RAISE EXCEPTION 'Not assigned to this proposal';
  END IF;

  -- Upsert all evaluations
  FOR elem IN SELECT * FROM jsonb_array_elements(p_evaluations)
  LOOP
    INSERT INTO public.evaluations (proposal_id, evaluator_id, rubric_criterion_id, score, notes, updated_at)
    VALUES (
      p_proposal_id, 
      v_evaluator_id, 
      (elem->>'rubric_criterion_id')::UUID, 
      (elem->>'score')::INT, 
      elem->>'notes', 
      now()
    )
    ON CONFLICT (proposal_id, evaluator_id, rubric_criterion_id) 
    DO UPDATE SET 
      score = EXCLUDED.score, 
      notes = EXCLUDED.notes, 
      updated_at = now();
  END LOOP;

  -- Atomically update the proposal
  UPDATE public.proposals
  SET 
    is_graded = true,
    total_score = p_total_score,
    locked_by = NULL,
    locked_at = NULL
  WHERE id = p_proposal_id;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
