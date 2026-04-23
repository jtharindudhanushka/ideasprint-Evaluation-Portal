# Project Context
Project: ideasprint 2026 Evaluation Dashboard
Objective: A robust, concurrency-safe evaluation portal for a lecture panel, coupled with a secure admin dashboard for event organizers.

# Branding Constraints
- ALWAYS format the event name strictly as "ideasprint 2026". Never use camelCase, PascalCase, or omit the space.

# Tech Stack Guidelines
- UI Components: Strictly use HeroUI (formerly NextUI) and Tailwind CSS for all styling.
- Backend/Database: Supabase.
- Core Framework & Libraries: You have the freedom to choose the most efficient framework (e.g., Next.js, Vite/React), state management, routing, form handling, and table libraries to accomplish the goals. Prioritize type safety and modern best practices.

# Core Architectural Rules
1. Role-Based Access Control (RBAC): Two roles exist: 'admin' and 'evaluator'. Protect `/admin` routes so only 'admin' users in the `profiles` table can access them.
2. Database Schema: Provide raw SQL scripts for all migrations and seeding so they can be run manually.
3. Dynamic Rubric: Fetch grading metrics and bands from the Supabase database. Do not hardcode criteria in the frontend.
4. Concurrency Locking: Evaluators cannot grade the same proposal simultaneously. If `locked_by` belongs to someone else, disable the Evaluate action and show a HeroUI Tooltip.
5. Abandoned Locks: Ignore locks older than 2 hours (based on `locked_at`).
6. UI/Styling: Rely strictly on standard HeroUI components (Cards, Tables, Inputs, Tooltips) and Tailwind utility classes. Use HeroUI Chips/Badges for grading bands.

---

# HANDOVER STATUS (Agent 1 → Agent 2)

## Chosen Stack
- **Framework**: Next.js 16.2.4 (App Router, Turbopack)
- **UI**: HeroUI v3.0.3 (`@heroui/react`, `@heroui/styles`) + Tailwind CSS v4
- **Auth/DB**: Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- **Forms**: react-hook-form, @hookform/resolvers, zod (installed but not yet wired)
- **Toasts**: sonner
- **Icons**: lucide-react
- **Deployment target**: Vercel + GitHub + Supabase free tier

## What Is DONE ✅

### Phase 1: SQL Migrations — COMPLETE
- `supabase/migrations/001_schema.sql` — All 5 tables (profiles, rubric_sections, rubric_criteria, proposals, evaluations), indexes, triggers, helper function `get_user_role()`
- `supabase/migrations/002_rls_policies.sql` — Full RLS with admin/evaluator policies for all tables

### Phase 2: SQL Seeding — COMPLETE
- `supabase/migrations/003_seed_rubric.sql` — All 11 criteria across 2 sections (Proposal 70 marks, Pitch Video 30 marks) with grading_bands JSONB

### Phase 3: Frontend — PARTIALLY COMPLETE (build fails)

**Files created and structurally complete:**
- `lib/supabase/client.ts` — Browser Supabase client
- `lib/supabase/server.ts` — Server Supabase client (cookies)
- `lib/supabase/admin.ts` — Service-role client for API routes
- `lib/supabase/middleware.ts` — Session + RBAC middleware logic
- `lib/types/database.ts` — TypeScript types for all tables
- `lib/utils.ts` — Lock checking, timeAgo, getBandColor utilities
- `middleware.ts` — Next.js middleware entry point
- `components/providers.tsx` — RouterProvider + I18nProvider + Sonner
- `components/navbar.tsx` — Header bar with branding, role chip, sign-out
- `components/sidebar.tsx` — Admin sidebar nav
- `app/layout.tsx` — Root layout (dark theme, Inter font)
- `app/page.tsx` — Root redirect stub
- `app/login/page.tsx` — Login form
- `app/admin/layout.tsx` — Admin layout (server-side RBAC)
- `app/admin/page.tsx` + `client.tsx` — Admin dashboard with stats + proposals table
- `app/admin/evaluators/page.tsx` + `client.tsx` — Invite evaluators + users table
- `app/admin/proposals/page.tsx` — Upload proposals form
- `app/evaluator/layout.tsx` — Evaluator layout
- `app/evaluator/page.tsx` + `client.tsx` — Evaluator dashboard with lock logic
- `app/evaluator/evaluate/[id]/page.tsx` + `client.tsx` — Full evaluation view with dynamic rubric, grading band chips, score inputs, progress bar, submit logic
- `app/api/invite-evaluator/route.ts` — Admin API for inviting evaluators
- `app/api/auth/callback/route.ts` — Auth callback handler
- `.env.local` + `.env.example` — Environment variable templates

## What NEEDS FIXING 🔧

### BUILD FAILS due to HeroUI v3 API differences

The installed version is HeroUI v3.0.3 which has a significantly different API from v2/NextUI. The following component API mismatches cause TypeScript build errors:

1. **Chip `variant="flat"` is invalid** — v3 Chip variants are: `"primary"`, `"secondary"`, `"soft"`, `"tertiary"`. Replace all `variant="flat"` on `<Chip>` with `variant="soft"` across:
   - `app/admin/client.tsx`
   - `app/admin/evaluators/client.tsx`
   - `app/evaluator/client.tsx`
   - `app/evaluator/evaluate/[id]/client.tsx`
   - `components/navbar.tsx`

2. **Other potential v3 API mismatches** to verify:
   - `Button` props: check if `isLoading`, `isIconOnly`, `isDisabled`, `startContent`, `variant="flat"`, `variant="light"`, `variant="bordered"` are valid in v3
   - `Input` props: check if `label`, `placeholder`, `variant="bordered"`, `startContent`, `endContent`, `isRequired`, `size="sm"` are valid in v3
   - `TextArea` props: check if `label`, `placeholder`, `variant="bordered"`, `size="sm"` are valid in v3
   - `Table` / `TableBody` / `TableHeader` / `TableColumn` / `TableRow` / `TableCell` — verify these all exist and accept the props used
   - `Card` / `CardContent` / `CardHeader` / `CardTitle` — verify all accept `className` prop
   - `Tooltip` / `TooltipTrigger` / `TooltipContent` — verify this compound pattern works
   - `ProgressBar` — verify `value`, `color`, `className` props
   - `Separator` — verify it exists and accepts `className`

3. **Next.js 16 middleware deprecation warning**: Middleware still works but shows a deprecation warning suggesting migration to "proxy". This is non-blocking but should be noted.

### RECOMMENDED FIX APPROACH
Run this to discover all valid exports and their prop types:
```bash
node --input-type=module -e "import * as h from '@heroui/react'; console.log(Object.keys(h).filter(e => !/Context|variants|Variants|^[a-z]/.test(e)).sort().join('\n'));"
```

Then for each component, check the `.d.ts` type files in `node_modules/@heroui/react/dist/` to see the correct prop types and variant values.

The key pattern: fix all `variant="flat"` → `variant="soft"` on Chips, then run `npm run build` and fix errors iteratively until it compiles clean.

## What Is NOT YET DONE ❌
- Build does not pass yet (see above)
- No visual polish/testing has been done (dev server hasn't been run successfully)
- `react-hook-form` + `zod` validation is installed but not wired into forms (forms use basic state management currently — works fine, just not as robust)
- No `.gitignore` update for `.env.local` (the default Next.js .gitignore should already cover it)
- First admin account setup instructions not written (manual: create user in Supabase Auth → set profiles.role = 'admin')

## Environment Variables Needed
```
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>
```
