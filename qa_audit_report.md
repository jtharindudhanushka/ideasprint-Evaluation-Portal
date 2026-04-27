# ideasprint 2026 — QA Audit Report
Generated: 2026-04-27
Audited by: Antigravity

## Summary
- P0 issues: 1
- P1 issues: 1
- P2 issues: 2
- P3 issues: 1

---

## Findings

### 1. Data Integrity & Security — Evaluators can maliciously overwrite proposal fields
- **File**: `supabase/migrations/004_assignments.sql`
- **Severity**: P0
- **Category**: RLS / Security
- **What's Wrong**: The RLS policy `evaluator_proposals_update` permits an evaluator to `UPDATE` the `proposals` table if `assigned_to = auth.uid()`. However, the policy does not restrict *which* columns can be modified.
- **Scenario**: A malicious or compromised evaluator account can send a custom API request to Supabase to update their assigned proposal, modifying `team_name`, `product_name`, `proposal_url` (to a malicious payload), or arbitrarily setting `total_score` to 100 to guarantee a team wins.
- **Fix**: Modify the RLS policy to explicitly restrict the allowed columns, or use a separate API route running with a service key for score updates. Since Supabase RLS does not easily restrict columns within an `UPDATE` policy directly without a trigger or `check` condition on `OLD`/`NEW`, the safest pattern is to use a `BEFORE UPDATE` trigger that ensures `NEW.team_name = OLD.team_name` (etc.) for non-admin users, or only allow `UPDATE` on specific lock/grade columns.

---

### 2. Data Integrity — Missing bounds checking for rubric scores
- **File**: `supabase/migrations/001_schema.sql` (line 102), `app/evaluator/evaluate/[id]/client.tsx`
- **Severity**: P1
- **Category**: Data Integrity
- **What's Wrong**: There are no database-level constraints on `evaluations.score`. It is simply defined as `INT NOT NULL DEFAULT 0`. The client-side UI (`handleScoreChange`) clamps the value, but client-side logic can easily be bypassed via API manipulation.
- **Scenario**: An evaluator intercepts the network request or uses browser DevTools to submit a score of `1000` for a single criterion with a max score of `10`. The database accepts it, the client calculates `totalScore` = `1000`, and sets `proposals.total_score` to `1000`.
- **Fix**: Add a `CHECK (score >= 0)` constraint to `evaluations.score`. Ideally, validate against `max_score` via a DB trigger, or enforce validation on a server-side API route instead of inserting directly from the client.

---

### 3. RLS / UI Bug — "Evaluated by" silently fails for other evaluators' work
- **File**: `supabase/migrations/002_rls_policies.sql`, `app/evaluator/page.tsx`
- **Severity**: P2
- **Category**: RLS / UI State
- **What's Wrong**: The RLS policy `evaluator_evaluations_select` ONLY allows an evaluator to `SELECT` their own evaluations (`USING (evaluator_id = auth.uid())`). However, the `evaluator/page.tsx` dashboard attempts to read all evaluations to construct the `evaluatorByProposal` map for the "All Proposals" table and "Top 15" leaderboard. Because the server component runs under the current user's authenticated session, RLS silently omits all evaluations authored by other evaluators.
- **Scenario**: Evaluator A grades Team X. When Evaluator B views the "All Proposals" or "Top 15" lists, Team X shows the `total_score` (since the `proposals` table is readable by everyone), but the "Evaluated by" pill is missing. Clicking "View Breakdown" shows "Detailed rubric scores are not available."
- **Fix**: Update the `evaluator_evaluations_select` policy in `002_rls_policies.sql` to allow all evaluators to read all evaluations (similar to what was done for the profiles table in `006_fix_profiles_rls.sql`).

---

### 4. Concurrency & Sync — Partial failure during evaluation submission
- **File**: `app/evaluator/evaluate/[id]/client.tsx` (lines 180-210)
- **Severity**: P2
- **Category**: Submission Flow / Error Handling
- **What's Wrong**: The submission logic performs two sequential API requests from the client: 1) `upsert` into `evaluations`, and 2) `update` the `proposals` table to set `total_score`, `is_graded: true`, and clear the lock. These are not wrapped in a single transactional unit.
- **Scenario**: An evaluator clicks "Submit". The `evaluations` upsert succeeds, but the user's internet drops or the second request to update `proposals` times out. The proposal remains `is_graded: false` with `total_score: 0` in the database, even though the rubric scores were saved.
- **Fix**: Move the submission logic to a secure server-side API route or a Supabase RPC (stored procedure) that executes both the `upsert` and the `update` inside a single PostgreSQL transaction.

---

### 5. Concurrency — Redundant and flawed locking mechanism
- **File**: `app/evaluator/evaluate/[id]/client.tsx` (lines 95-138)
- **Severity**: P3
- **Category**: Concurrency
- **What's Wrong**: The `locked_by` mechanism is functionally defunct. 
  1. Proposals are explicitly 1-to-1 assigned via `assigned_to` (`004_assignments.sql`). The page load logic securely redirects any evaluator who is not the assignee. Therefore, cross-evaluator concurrency collisions are impossible by design.
  2. For same-user concurrency (e.g., multiple tabs), the lock `UPDATE` query uses `.or(locked_by.eq.${currentUserId})`, which always succeeds for the assignee, thus instantly overwriting the lock.
  3. The `serverNow` timestamp used to acquire the lock is fixed at the moment the React page initially loads. If the user leaves the tab open for an hour before clicking "Edit Grading", the lock acquires an hour-old timestamp.
- **Fix**: Since `assigned_to` strictly guarantees 1-to-1 evaluator mapping, the `locked_by` and `locked_at` columns and client-side logic can be safely removed to reduce complexity and unnecessary database calls.

---

## Prioritized Fix Order

1. **P0/P1**: Migrate submission logic (`handleSubmit` in `evaluate/[id]/client.tsx`) to a server-side Next.js API route using the `adminClient` or create a Supabase RPC. This solves:
   - The P0 RLS issue (you can revoke evaluator `UPDATE` on `proposals` entirely).
   - The P1 Score bounds issue (validate `score <= max_score` on the server).
   - The P2 Transaction issue (perform updates sequentially in the secure environment or use an RPC).
2. **P2**: Run an SQL migration to relax `evaluator_evaluations_select` so evaluators can read all evaluations, restoring the "Evaluated by" UI.
3. **P3**: Remove the `locked_by` mechanism to simplify the codebase.

---

## Pre-Launch Regression Checklist

1. **Malicious Payload Test**: Log in as an evaluator, use browser DevTools network tab to intercept the `proposals` update call, and attempt to change the `total_score` or `team_name` manually. Verify it is blocked.
2. **Bounds Test**: Submit an evaluation with a score of -5 or 999 for a criterion. Verify the system rejects it and does not corrupt the proposal's total score.
3. **UI Visibility Test**: Log in as Evaluator A, evaluate a proposal. Log in as Evaluator B, verify Evaluator A's name appears correctly under the Top 15 list and Breakdown dialog.
4. **Network Drop Test**: Throttle network to offline immediately after clicking "Submit Evaluation". Reconnect and verify the system is not in an inconsistent state (either both evaluations and proposal stats updated, or neither).

## Audit Status
COMPLETE
