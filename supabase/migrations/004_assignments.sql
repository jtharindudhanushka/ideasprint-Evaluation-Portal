-- ============================================================
-- ideasprint 2026 Evaluation Dashboard
-- Migration 004: Proposal Assignment System
-- Run this in the Supabase SQL Editor AFTER 001, 002, 003.
-- ============================================================

-- 1. Add assigned_to column to proposals
ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_proposals_assigned_to ON public.proposals(assigned_to);

COMMENT ON COLUMN public.proposals.assigned_to IS 'The evaluator explicitly assigned to grade this proposal by an admin. NULL = unassigned.';

-- 2. Drop the old permissive evaluator update policy and replace with assignment-enforced one
DROP POLICY IF EXISTS "evaluator_proposals_update" ON public.proposals;

-- Evaluators may only UPDATE proposals that are explicitly assigned to them.
-- This is the hard database-level gate that cannot be bypassed from the frontend.
CREATE POLICY "evaluator_proposals_update"
  ON public.proposals FOR UPDATE TO authenticated
  USING (
    (SELECT public.get_user_role()) = 'evaluator'
    AND assigned_to = auth.uid()
  )
  WITH CHECK (
    (SELECT public.get_user_role()) = 'evaluator'
    AND assigned_to = auth.uid()
  );
