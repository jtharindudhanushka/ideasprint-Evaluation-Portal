-- ============================================================
-- ideasprint 2026 Evaluation Dashboard
-- Migration 016: Secure Evaluation Lock (Server-Side)
-- Run this in the Supabase SQL Editor.
-- ============================================================

-- 1. Update the submit_evaluation RPC to enforce the evaluations_locked setting for non-admins
CREATE OR REPLACE FUNCTION public.submit_evaluation(
  p_proposal_id UUID,
  p_evaluations JSONB
) RETURNS VOID AS $$
DECLARE
  v_evaluator_id UUID;
  elem JSONB;
  v_new_score INT;
  v_is_admin BOOLEAN;
  v_locked BOOLEAN;
BEGIN
  -- Get the current authenticated user ID
  v_evaluator_id := auth.uid();
  IF v_evaluator_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if the current user is an admin
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = v_evaluator_id AND role = 'admin'
  ) INTO v_is_admin;

  -- If not an admin, check if evaluations are locked in system_settings
  IF NOT v_is_admin THEN
    SELECT EXISTS (
      SELECT 1 FROM public.system_settings
      WHERE key = 'evaluations_locked' AND (value = '"true"'::jsonb OR value = 'true'::jsonb)
    ) INTO v_locked;
    
    IF v_locked THEN
      RAISE EXCEPTION 'Evaluations are locked. You cannot modify your grades after the deadline.';
    END IF;
  END IF;

  -- Ensure the proposal is assigned to the current user (admins bypass this check to allow admin overrides)
  IF NOT v_is_admin AND NOT EXISTS (
    SELECT 1 FROM public.proposal_assignments 
    WHERE proposal_id = p_proposal_id AND evaluator_id = v_evaluator_id
  ) THEN
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

  -- Calculate the new average total score across all evaluators who submitted
  WITH evaluator_totals AS (
    SELECT evaluator_id, SUM(score) as total
    FROM public.evaluations
    WHERE proposal_id = p_proposal_id
    GROUP BY evaluator_id
  )
  SELECT ROUND(AVG(total)) INTO v_new_score FROM evaluator_totals;

  -- Atomically update the proposal
  UPDATE public.proposals
  SET 
    is_graded = true,
    total_score = COALESCE(v_new_score, 0)
  WHERE id = p_proposal_id;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Restructure evaluation_overall_notes RLS to block edits for non-admins if locked
DROP POLICY IF EXISTS "evaluator_own_overall_notes" ON public.evaluation_overall_notes;

CREATE POLICY "evaluator_own_overall_notes"
  ON public.evaluation_overall_notes
  FOR ALL
  TO authenticated
  USING (
    evaluator_id = auth.uid() AND
    (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      ) OR
      NOT EXISTS (
        SELECT 1 FROM public.system_settings
        WHERE key = 'evaluations_locked' AND (value = '"true"'::jsonb OR value = 'true'::jsonb)
      )
    )
  )
  WITH CHECK (
    evaluator_id = auth.uid() AND
    (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      ) OR
      NOT EXISTS (
        SELECT 1 FROM public.system_settings
        WHERE key = 'evaluations_locked' AND (value = '"true"'::jsonb OR value = 'true'::jsonb)
      )
    )
  );
