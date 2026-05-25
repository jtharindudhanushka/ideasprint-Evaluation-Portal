-- ============================================================
-- Migration 014: Evaluator Feedback
-- ============================================================

-- 1. Create the evaluator_feedback table
CREATE TABLE IF NOT EXISTS evaluator_feedback (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluator_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_rating  integer CHECK (overall_rating >= 1 AND overall_rating <= 5),
  ease_of_use     text CHECK (ease_of_use IN ('very_difficult', 'difficult', 'neutral', 'easy', 'very_easy')),
  comments        text,
  submitted_at    timestamptz DEFAULT now(),
  has_seen_prompt boolean NOT NULL DEFAULT false,
  -- One row per evaluator (upsert on conflict)
  UNIQUE (evaluator_id)
);

-- 2. Enable RLS
ALTER TABLE evaluator_feedback ENABLE ROW LEVEL SECURITY;

-- 3. Evaluators: can insert their own row
CREATE POLICY "evaluators_insert_own_feedback"
  ON evaluator_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (evaluator_id = auth.uid());

-- 4. Evaluators: can read their own row
CREATE POLICY "evaluators_select_own_feedback"
  ON evaluator_feedback
  FOR SELECT
  TO authenticated
  USING (evaluator_id = auth.uid());

-- 5. Evaluators: can update their own row
CREATE POLICY "evaluators_update_own_feedback"
  ON evaluator_feedback
  FOR UPDATE
  TO authenticated
  USING (evaluator_id = auth.uid())
  WITH CHECK (evaluator_id = auth.uid());

-- 6. Admins: can read all rows
CREATE POLICY "admins_select_all_feedback"
  ON evaluator_feedback
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
