-- ============================================================
-- Migration 012: Fix duplicate notes from globalNotes bleed-through
-- ============================================================
-- Context: A bug in evaluate/[id]/client.tsx caused the "Overall
-- Comments" (globalNotes) text to be saved into the `notes` column
-- of EVERY criterion that had no individual note on submit.
--
-- Detection: if the same non-empty note text appears on more than
-- one criterion for the same evaluator+proposal, it is almost
-- certainly a bleed-through. Genuine per-criterion notes are
-- unique by nature.
--
-- Effect: Sets those notes to '' (empty string). Scores, proposals,
-- assignments, profiles, and all other columns are NOT touched.
-- ============================================================

UPDATE evaluations e
SET    notes = ''
WHERE  notes <> ''
  AND  EXISTS (
         SELECT 1
         FROM   evaluations e2
         WHERE  e2.proposal_id        = e.proposal_id
           AND  e2.evaluator_id       = e.evaluator_id
           AND  e2.notes              = e.notes        -- exact same text
           AND  e2.rubric_criterion_id <> e.rubric_criterion_id  -- different criterion
       );
