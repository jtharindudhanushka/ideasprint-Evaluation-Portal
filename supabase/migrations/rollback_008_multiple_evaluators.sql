-- ============================================================
-- ideasprint 2026 Evaluation Dashboard
-- Rollback for Migration 008: Multiple Evaluator Assignments
-- ============================================================

-- 1. Re-add the dropped columns to proposals
ALTER TABLE public.proposals
  ADD COLUMN assigned_to UUID,
  ADD COLUMN locked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN locked_at TIMESTAMPTZ;

-- 2. Migrate data back (picks the oldest assignment if there are multiple)
UPDATE public.proposals p
SET assigned_to = (
  SELECT evaluator_id 
  FROM public.proposal_assignments pa 
  WHERE pa.proposal_id = p.id 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- 3. Drop the new junction table and its policies
DROP TABLE IF EXISTS public.proposal_assignments CASCADE;

-- 4. Revert the submit_evaluation RPC to its previous state
CREATE OR REPLACE FUNCTION public.submit_evaluation(
  p_proposal_id UUID,
  p_evaluations JSONB,
  p_total_score INT
) RETURNS VOID AS $$
DECLARE
  v_evaluator_id UUID;
  elem JSONB;
BEGIN
  -- Get the current authenticated user ID
  v_evaluator_id := auth.uid();
  IF v_evaluator_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Ensure the proposal is assigned to the current user
  IF NOT EXISTS (
    SELECT 1 FROM public.proposals 
    WHERE id = p_proposal_id AND assigned_to = v_evaluator_id
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
