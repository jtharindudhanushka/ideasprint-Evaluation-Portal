# Project Context
Project: ideasprint 2026 Evaluation Dashboard
Objective: A robust, concurrency-safe evaluation portal for a lecture panel, coupled with a secure admin dashboard for event organizers.

# Branding Constraints
- ALWAYS format the event name strictly as "ideasprint 2026". Never use camelCase, PascalCase, or omit the space.

# Tech Stack Guidelines
- UI Components: Strictly use shadcn/ui components (Card, Table, Badge, Button, Input, Dialog, Tooltip, Avatar) and Tailwind CSS for all styling. HeroUI was the original intent but the actual implementation uses shadcn/ui — do NOT introduce HeroUI.
- Backend/Database: Supabase.
- Core Framework & Libraries: Next.js 16 (App Router, Turbopack). State management via React `useState`/`useMemo`. Form handling via native React state (react-hook-form + zod are installed but not wired — not required). Toasts via `sonner`. Icons via `lucide-react`.

# Core Architectural Rules
1. Role-Based Access Control (RBAC): Two roles exist: 'admin' and 'evaluator'. Protect `/admin` routes so only 'admin' users in the `profiles` table can access them. Evaluators are redirected to `/evaluator`.
2. Database Schema: Provide raw SQL scripts for all migrations and seeding so they can be run manually under `supabase/migrations/`.
3. Dynamic Rubric: Fetch grading metrics and bands from the Supabase database. Do not hardcode criteria in the frontend.
4. Concurrency Locking: Evaluators cannot grade the same proposal simultaneously. If `locked_by` belongs to someone else, disable the Evaluate action and show a shadcn Tooltip with the locker's name and time.
5. Abandoned Locks: Ignore locks older than 2 hours (based on `locked_at`). The `isLockedByOther()` utility in `lib/utils.ts` handles this using `serverNow` to avoid client clock skew.
6. Proposal Assignment: Proposals are assigned to a specific evaluator via `proposals.assigned_to`. Evaluators only see and can grade their own assigned proposals in "My Assignments". The "All Proposals" section is read-only for awareness.
7. UI/Styling: Use shadcn/ui components and Tailwind utility classes. Use `<Badge>` for status chips. Use `<Dialog>` for grade breakdown popups. Tables must be wrapped in `overflow-x-auto` divs for mobile scroll.

---

# CURRENT STATUS — PRODUCTION READY ✅

The build passes (`npx tsc --noEmit` exits clean). The dev server runs. All core features are implemented and working.

## Chosen Stack
- **Framework**: Next.js 16.2.4 (App Router, Turbopack)
- **UI**: shadcn/ui components + Tailwind CSS v4
- **Auth/DB**: Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- **Forms**: Native React state (`react-hook-form` + `zod` installed but unused)
- **Toasts**: sonner
- **Icons**: lucide-react
- **Deployment target**: Vercel + GitHub + Supabase free tier

---

## Completed Features ✅

### Phase 1: SQL Migrations — COMPLETE
- `supabase/migrations/001_schema.sql` — All 5 tables (`profiles`, `rubric_sections`, `rubric_criteria`, `proposals`, `evaluations`), indexes, triggers, helper function `get_user_role()`
- `supabase/migrations/002_rls_policies.sql` — Full RLS with admin/evaluator policies for all tables
- `supabase/migrations/006_fix_profiles_rls.sql` — RLS fix for profiles table visibility

### Phase 2: SQL Seeding — COMPLETE
- `supabase/migrations/003_seed_rubric.sql` — All 11 criteria across 2 sections (Proposal 70 marks, Pitch Video 30 marks) with `grading_bands` JSONB

### Phase 3: Frontend — COMPLETE & BUILDING

#### Infrastructure
- `lib/supabase/client.ts` — Browser Supabase client
- `lib/supabase/server.ts` — Server Supabase client (cookies)
- `lib/supabase/admin.ts` — Service-role client for API routes
- `lib/supabase/middleware.ts` — Session + RBAC middleware logic
- `lib/types/database.ts` — TypeScript types for all tables
- `lib/utils.ts` — `isLockedByOther()`, `timeAgo()`, `getBandColor()` utilities
- `middleware.ts` — Next.js middleware entry point (role-based redirect)
- `components/providers.tsx` — RouterProvider + Sonner toaster
- `components/navbar.tsx` — Header with logo, branding, avatar dropdown, sign-out. Mobile-safe.
- `components/sidebar.tsx` — Admin sidebar nav
- `app/layout.tsx` — Root layout (dark theme, Inter font)
- `app/page.tsx` — Root redirect stub (redirects to `/login`)
- `.env.local` + `.env.example` — Environment variable templates

#### Auth
- `app/login/page.tsx` — Login form. **Mobile-responsive**: shows branding strip on mobile, two-column image+form on desktop (lg+). Previously broken (`hidden` class made it invisible on mobile — now fixed).
- `app/api/auth/callback/route.ts` — Auth callback handler

#### Admin Area (`/admin/*`)
- `app/admin/layout.tsx` — Server-side RBAC guard; redirects non-admins
- `app/admin/page.tsx` + `client.tsx` — Admin dashboard:
  - 4 stat cards (Total, Graded, Pending, Avg Score)
  - Proposals table with Team, Assigned To, Status, Total score, Breakdown button
  - **Top 15 leaderboard** sidebar with rank, team name, score, breakdown button, and **"Evaluated by [Name]" pill** under each team
  - Grade breakdown dialog shows total score, **"Evaluated by" pill**, and per-criterion rubric scores
  - `evaluatorByProposal: Record<string, string>` map built server-side (proposalId → evaluator full_name)
- `app/admin/evaluators/page.tsx` + `client.tsx` — Invite evaluators (POST to API) + users table
- `app/admin/proposals/page.tsx` — Upload proposals form

#### Evaluator Area (`/evaluator/*`)
- `app/evaluator/layout.tsx` — Auth guard + Navbar. Padding is mobile-responsive: `p-4 sm:p-6 md:p-8`.
- `app/evaluator/page.tsx` + `client.tsx` — Evaluator dashboard (fully mobile-optimised):
  - **3 stat cards** always in a `grid-cols-3` row (compact on mobile)
  - **My Assignments** table — shows team, links (PDF/video icon buttons), status badge, and Evaluate/Locked/Breakdown action. Table wrapped in `overflow-x-auto`.
  - **All Proposals** (view-only) table — columns: Team & Product | Assigned To | Status | **Marks** (score/100 bold) | **Breakdown** (outline button with BarChart icon). Previously the score and view button were merged into one ghost-text cell — now clearly separated. Table wrapped in `overflow-x-auto`.
  - **Top 15 Teams** sidebar — rank badge, team name, score, breakdown button. Each item shows an **"Evaluated by [Name]" pill** under the team name.
  - Grade breakdown dialog shows total score, **"Evaluated by" pill**, and per-criterion rubric scores, plus links to PDF/video and "Edit Grading" if graded by the current user.
  - `evaluatorByProposal: Record<string, string>` map built server-side and passed as prop
  - Split-view grid breaks at `xl` (not `lg`) so tablets see stacked layout properly
- `app/evaluator/evaluate/[id]/page.tsx` + `client.tsx` — Full evaluation view:
  - Dynamic rubric sections + criteria fetched from DB
  - Grading band chips shown per criterion
  - Score inputs with live progress bar
  - Lock acquired on mount, released on submit/unmount
  - Assignment guard: non-assigned evaluators redirected with `?error=not_assigned` toast

#### API Routes
- `app/api/invite-evaluator/route.ts` — Admin-only API; creates Supabase Auth user + inserts profile with `role='evaluator'`

---

## Known Limitations / Not Yet Done
- `react-hook-form` + `zod` are installed but forms use native React state — works correctly, just not as robust for complex validation
- First admin account must be created manually: create user in Supabase Auth → set `profiles.role = 'admin'`
- No automated tests

---

## Environment Variables Needed
```
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>
```

---

## Key Data Patterns

### evaluatorByProposal map (server-side)
Both `app/evaluator/page.tsx` and `app/admin/page.tsx` build this map:
```ts
// evaluations query must include evaluator_id
const evaluatorByProposal: Record<string, string> = {};
for (const ev of evaluations) {
  if (!evaluatorByProposal[ev.proposal_id]) {
    const profile = profiles.find((p) => p.id === ev.evaluator_id);
    if (profile) evaluatorByProposal[ev.proposal_id] = profile.full_name;
  }
}
```
This is passed as a prop to both `AdminDashboardClient` and `EvaluatorDashboardClient`.

### Lock checking
`isLockedByOther(locked_by, locked_at, currentUserId, serverNow)` in `lib/utils.ts` returns `true` only if:
- `locked_by` is set and is not `currentUserId`
- The lock is less than 2 hours old (compared against `serverNow` from the server, not client clock)

### Breakdown deduplication
- **Evaluator dashboard**: only the current user's own evaluation scores are shown (filtered by `evaluator_id === user.id`), deduplicated by `rubric_criterion_id` (last write wins).
- **Admin dashboard**: all evaluators' scores for a proposal are averaged per criterion.
