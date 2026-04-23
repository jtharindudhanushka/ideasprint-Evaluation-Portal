-- ============================================================
-- ideasprint 2026 Evaluation Dashboard
-- Migration 001: Schema (Tables, Indexes, Triggers, Functions)
-- Run this in the Supabase SQL Editor.
-- ============================================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES
-- ============================================================
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('admin', 'evaluator')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Stores user metadata and role for RBAC.';

-- Auto-create a profile row when a new auth user is created.
-- Default role is ''evaluator''; admins are set manually.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'evaluator')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. RUBRIC SECTIONS
-- ============================================================
CREATE TABLE public.rubric_sections (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  total_marks  INT  NOT NULL,
  order_index  INT  NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.rubric_sections IS 'Top-level groupings of the evaluation rubric.';

-- ============================================================
-- 3. RUBRIC CRITERIA
-- ============================================================
CREATE TABLE public.rubric_criteria (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id    UUID NOT NULL REFERENCES public.rubric_sections(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT NOT NULL,
  max_score     INT  NOT NULL,
  grading_bands JSONB NOT NULL DEFAULT '[]'::jsonb,
  order_index   INT  NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.rubric_criteria IS 'Individual criteria within a rubric section, with JSONB grading bands.';

CREATE INDEX idx_rubric_criteria_section ON public.rubric_criteria(section_id);

-- ============================================================
-- 4. PROPOSALS
-- ============================================================
CREATE TABLE public.proposals (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_name     TEXT NOT NULL,
  product_name  TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  proposal_url  TEXT NOT NULL DEFAULT '',
  video_url     TEXT NOT NULL DEFAULT '',
  locked_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  locked_at     TIMESTAMPTZ,
  total_score   INT  NOT NULL DEFAULT 0,
  is_graded     BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.proposals IS 'Team proposals to be evaluated by the panel.';

CREATE INDEX idx_proposals_locked_by ON public.proposals(locked_by);

-- ============================================================
-- 5. EVALUATIONS
-- ============================================================
CREATE TABLE public.evaluations (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id         UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  evaluator_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rubric_criterion_id UUID NOT NULL REFERENCES public.rubric_criteria(id) ON DELETE CASCADE,
  score               INT  NOT NULL DEFAULT 0,
  notes               TEXT NOT NULL DEFAULT '',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_evaluation UNIQUE (proposal_id, evaluator_id, rubric_criterion_id)
);

COMMENT ON TABLE public.evaluations IS 'Individual scores per criterion per evaluator per proposal.';

CREATE INDEX idx_evaluations_proposal   ON public.evaluations(proposal_id);
CREATE INDEX idx_evaluations_evaluator  ON public.evaluations(evaluator_id);
CREATE INDEX idx_evaluations_criterion  ON public.evaluations(rubric_criterion_id);

-- ============================================================
-- 6. HELPER FUNCTION: get_user_role()
-- Used inside RLS policies. SECURITY DEFINER so it can always
-- read the profiles table regardless of the caller's RLS.
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;
