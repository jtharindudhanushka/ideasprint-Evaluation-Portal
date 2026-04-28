-- ============================================================
-- ideasprint 2026 Evaluation Dashboard
-- Migration 008: Multiple Evaluator Assignments
-- Run this in the Supabase SQL Editor.
-- ============================================================

-- 1. Create the proposal_assignments junction table
CREATE TABLE public.proposal_assignments (
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  evaluator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (proposal_id, evaluator_id)
);

COMMENT ON TABLE public.proposal_assignments IS 'Links proposals to multiple assigned evaluators.';

-- 2. Migrate existing assignments
INSERT INTO public.proposal_assignments (proposal_id, evaluator_id)
SELECT id, assigned_to
FROM public.proposals
WHERE assigned_to IS NOT NULL;

-- 3. Drop old assignment and locking columns from proposals
ALTER TABLE public.proposals
  DROP COLUMN assigned_to,
  DROP COLUMN locked_by,
  DROP COLUMN locked_at;

-- 4. Enable RLS on proposal_assignments
ALTER TABLE public.proposal_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "evaluator_assignments_select"
  ON public.proposal_assignments FOR SELECT TO authenticated
  USING ((SELECT public.get_user_role()) IN ('admin', 'evaluator'));

-- Allow admins to manage assignments
CREATE POLICY "admin_assignments_manage"
  ON public.proposal_assignments FOR ALL TO authenticated
  USING ((SELECT public.get_user_role()) = 'admin')
  WITH CHECK ((SELECT public.get_user_role()) = 'admin');

-- 5. Update the submit_evaluation RPC to calculate average scores and check new assignments
CREATE OR REPLACE FUNCTION public.submit_evaluation(
  p_proposal_id UUID,
  p_evaluations JSONB
) RETURNS VOID AS $$
DECLARE
  v_evaluator_id UUID;
  elem JSONB;
  v_new_score INT;
BEGIN
  -- Get the current authenticated user ID
  v_evaluator_id := auth.uid();
  IF v_evaluator_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Ensure the proposal is assigned to the current user
  IF NOT EXISTS (
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
