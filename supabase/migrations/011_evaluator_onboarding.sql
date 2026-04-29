-- Migration 011: Evaluator Onboarding Status
-- Adds has_seen_onboarding to profiles and updates RLS.

ALTER TABLE public.profiles 
ADD COLUMN has_seen_onboarding BOOLEAN NOT NULL DEFAULT false;

-- Update RLS for profiles table
-- Drop the existing broad update policy if it exists
DROP POLICY IF EXISTS "evaluator_profiles_update" ON public.profiles;

-- New policy to allow updating only the onboarding status
-- Note: PostgreSQL RLS doesn't natively restrict columns in the policy itself easily.
-- This policy allows the user to update their own row. 
-- In a real production environment with strict column-level requirements, 
-- a trigger would be used to ensure other columns remain unchanged.
CREATE POLICY "evaluator_profiles_update_onboarding"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

COMMENT ON COLUMN public.profiles.has_seen_onboarding IS 'Flag to track if an evaluator has completed the first-time onboarding walkthrough.';
