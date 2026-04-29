-- ============================================================
-- ideasprint 2026 Evaluation Dashboard
-- Migration 009: PDF Annotations & Video Timestamp Comments
-- Run this in the Supabase SQL Editor AFTER 001-008.
-- ============================================================

-- ============================================================
-- 1. PDF ANNOTATIONS
-- ============================================================
CREATE TABLE public.pdf_annotations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id     UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  evaluator_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page_number     INT NOT NULL,
  start_offset    INT NOT NULL,
  end_offset      INT NOT NULL,
  rect_x          FLOAT NOT NULL,
  rect_y          FLOAT NOT NULL,
  rect_width      FLOAT NOT NULL,
  rect_height     FLOAT NOT NULL,
  color           TEXT NOT NULL DEFAULT '#FFEB3B',
  comment         TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT check_page_positive CHECK (page_number > 0),
  CONSTRAINT check_offsets CHECK (end_offset >= start_offset)
);

COMMENT ON TABLE public.pdf_annotations IS 'Evaluator annotations on proposal PDFs. Stores page, character offsets, and percentage-based bounding rect.';

CREATE INDEX idx_annotations_proposal ON public.pdf_annotations(proposal_id);
CREATE INDEX idx_annotations_evaluator ON public.pdf_annotations(evaluator_id);

-- RLS
ALTER TABLE public.pdf_annotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "annotations_select"
  ON public.pdf_annotations FOR SELECT TO authenticated
  USING ((SELECT public.get_user_role()) IN ('admin', 'evaluator'));

CREATE POLICY "annotations_insert"
  ON public.pdf_annotations FOR INSERT TO authenticated
  WITH CHECK (evaluator_id = auth.uid());

CREATE POLICY "annotations_update"
  ON public.pdf_annotations FOR UPDATE TO authenticated
  USING (evaluator_id = auth.uid())
  WITH CHECK (evaluator_id = auth.uid());

CREATE POLICY "annotations_delete"
  ON public.pdf_annotations FOR DELETE TO authenticated
  USING (evaluator_id = auth.uid());

-- ============================================================
-- 2. VIDEO TIMESTAMP COMMENTS
-- ============================================================
CREATE TABLE public.video_comments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id     UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  evaluator_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp_secs  FLOAT NOT NULL,
  comment         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT check_timestamp_positive CHECK (timestamp_secs >= 0)
);

COMMENT ON TABLE public.video_comments IS 'Evaluator timestamped comments on pitch videos.';

CREATE INDEX idx_video_comments_proposal ON public.video_comments(proposal_id);
CREATE INDEX idx_video_comments_evaluator ON public.video_comments(evaluator_id);

-- RLS
ALTER TABLE public.video_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "video_comments_select"
  ON public.video_comments FOR SELECT TO authenticated
  USING ((SELECT public.get_user_role()) IN ('admin', 'evaluator'));

CREATE POLICY "video_comments_insert"
  ON public.video_comments FOR INSERT TO authenticated
  WITH CHECK (evaluator_id = auth.uid());

CREATE POLICY "video_comments_update"
  ON public.video_comments FOR UPDATE TO authenticated
  USING (evaluator_id = auth.uid())
  WITH CHECK (evaluator_id = auth.uid());

CREATE POLICY "video_comments_delete"
  ON public.video_comments FOR DELETE TO authenticated
  USING (evaluator_id = auth.uid());
