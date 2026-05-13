-- ============================================================
-- ideasprint 2026 Evaluation Dashboard
-- Migration 013: Evaluation Overall Notes
-- Run this in the Supabase SQL Editor.
-- ============================================================
-- Fully additive — does NOT alter evaluations, proposals,
-- submit_evaluation RPC, or any existing data.
-- ============================================================

CREATE TABLE public.evaluation_overall_notes (
  proposal_id   UUID        NOT NULL REFERENCES public.proposals(id)  ON DELETE CASCADE,
  evaluator_id  UUID        NOT NULL REFERENCES auth.users(id)         ON DELETE CASCADE,
  notes         TEXT        NOT NULL DEFAULT '',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (proposal_id, evaluator_id)
);

COMMENT ON TABLE public.evaluation_overall_notes IS
  'One overall comment per evaluator per proposal. '
  'Separate from per-criterion notes in the evaluations table.';

-- Row Level Security
ALTER TABLE public.evaluation_overall_notes ENABLE ROW LEVEL SECURITY;

-- Evaluators: full access to their own rows only
CREATE POLICY "evaluator_own_overall_notes"
  ON public.evaluation_overall_notes
  FOR ALL
  TO authenticated
  USING  (evaluator_id = auth.uid())
  WITH CHECK (evaluator_id = auth.uid());

-- Admins: read-only access to all rows
CREATE POLICY "admin_read_overall_notes"
  ON public.evaluation_overall_notes
  FOR SELECT
  TO authenticated
  USING ((SELECT public.get_user_role()) = 'admin');
