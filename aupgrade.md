# ideasprint 2026 — Exhaustive Upgrade Planning Document

> **Purpose**: Single source of truth for a team of AI models to execute a full system upgrade without further human input.
> **Generated**: 2026-04-29 from complete codebase read.

---

## 1. SYSTEM INVENTORY

### 1.1 Tech Stack (Exact Versions)

| Dependency | Version | Purpose |
|---|---|---|
| next | 16.2.4 | App Router, Turbopack |
| react / react-dom | 19.2.4 | UI framework |
| @supabase/ssr | 0.10.2 | Server-side Supabase client |
| @supabase/supabase-js | 2.104.0 | Supabase JS client |
| tailwindcss | ^4 | Utility CSS (v4 syntax) |
| @tailwindcss/postcss | ^4 | PostCSS plugin for Tailwind v4 |
| shadcn | 4.4.0 | Component CLI (base-nova style) |
| @base-ui/react | 1.4.1 | Primitives under shadcn components |
| class-variance-authority | 0.7.1 | Variant styling |
| clsx | 2.1.1 | Class merging |
| tailwind-merge | 3.5.0 | Tailwind class dedup |
| tw-animate-css | 1.4.0 | Animation utilities |
| lucide-react | 1.8.0 | Icons |
| sonner | 2.0.7 | Toast notifications |
| next-themes | 0.4.6 | Dark/light mode |
| papaparse | 5.5.3 | CSV parsing |
| pdfjs-dist | 5.7.284 | PDF rendering (installed, unused in app code) |
| react-pdf | 10.4.1 | React PDF viewer (installed, unused) |
| react-pdf-highlighter | 8.0.0-rc.0 | PDF annotation (installed, unused) |
| react-youtube | 10.1.0 | YouTube embed (installed, unused) |
| react-hook-form | 7.73.1 | Form library (installed, unused) |
| zod | 4.3.6 | Schema validation (installed, unused) |
| typescript | ^5 | Type checking |

### 1.2 Routes & Pages

| Route | File(s) | Type | Purpose |
|---|---|---|---|
| `/` | `app/page.tsx` | RSC | Returns `null`; middleware redirects to `/login`, `/admin`, or `/evaluator` |
| `/login` | `app/login/page.tsx` | Client | Email/password sign-in form. Two-column on lg+, stacked on mobile |
| `/admin` | `app/admin/page.tsx` → `app/admin/client.tsx` | RSC→Client | Admin dashboard: 4 stat cards, proposals table, Top 15 leaderboard |
| `/admin/evaluators` | `app/admin/evaluators/page.tsx` → `client.tsx` | RSC→Client | Create evaluator accounts + users table |
| `/admin/proposals` | `app/admin/proposals/page.tsx` | Client | Single + bulk CSV upload of proposals |
| `/admin/assignments` | `app/admin/assignments/page.tsx` → `client.tsx` | RSC→Client | Multi-evaluator assignment with bulk action bar |
| `/evaluator` | `app/evaluator/page.tsx` → `client.tsx` | RSC→Client | Evaluator dashboard: stats, My Assignments, All Proposals, Top 15 |
| `/evaluator/evaluate/[id]` | `page.tsx` → `client.tsx` | RSC→Client | Full rubric evaluation form with score inputs, bands, progress bar |
| `/api/auth/callback` | `app/api/auth/callback/route.ts` | API GET | OAuth code exchange, role-based redirect |
| `/api/create-evaluator` | `app/api/create-evaluator/route.ts` | API POST | Admin-only: creates Supabase Auth user + profile |
| `/api/proxy/pdf/` | Directory exists, empty | — | Placeholder for PDF proxy (no route.ts file present) |

#### Loading States
- `app/admin/loading.tsx` — Spinner + "Loading dashboard..."
- `app/evaluator/loading.tsx` — Spinner + "Loading assignments..."
- `app/evaluator/evaluate/[id]/loading.tsx` — Spinner + "Loading evaluation rubric..."

#### Error Pages
- **None exist.** No `error.tsx`, `not-found.tsx`, or `global-error.tsx` anywhere.

### 1.3 Layouts

| Layout | File | Behavior |
|---|---|---|
| Root | `app/layout.tsx` | Geist font (Inter via Google Fonts), `<Providers>` wrapper, dark theme support |
| Admin | `app/admin/layout.tsx` | Server auth guard → `<Navbar>` + `<Sidebar>` + `<main>` with `p-8 pt-6` |
| Evaluator | `app/evaluator/layout.tsx` | Server auth guard → `<Navbar>` + `<main>` with responsive padding `p-4 sm:p-6 md:p-8` |

### 1.4 Components

#### Shared Components (`components/`)

| Component | File | Props | Notes |
|---|---|---|---|
| `Navbar` | `navbar.tsx` | `fullName: string, role: UserRole` | Logo, branding (hidden on sm), ThemeToggle, avatar dropdown with sign-out |
| `Sidebar` | `sidebar.tsx` | none | 4 admin nav links: Dashboard, Evaluators, Upload Proposals, Assign Proposals |
| `Providers` | `providers.tsx` | `children` | `ThemeProvider` (class-based, system default) + `Toaster` (top-right) |
| `ThemeToggle` | `theme-toggle.tsx` | none | Sun/Moon toggle button |

#### shadcn/ui Primitives (`components/ui/`) — All use `@base-ui/react` primitives

`alert-dialog.tsx`, `avatar.tsx`, `badge.tsx`, `button.tsx`, `card.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `input.tsx`, `label.tsx`, `progress.tsx`, `separator.tsx`, `table.tsx`, `tabs.tsx`, `textarea.tsx`, `tooltip.tsx`

**Key**: Button uses `rounded-full` (pill shape) by default. Card uses `shadow-[0px_4px_16px_rgba(0,0,0,0.12)]` and `ring-1 ring-foreground/10`.

### 1.5 Global Styles (`app/globals.css`)

- Imports: `tailwindcss`, `tw-animate-css`, `shadcn/tailwind.css`
- Dark variant: `@custom-variant dark (&:is(.dark *))`
- Font: `--font-sans: "Inter", ui-sans-serif, system-ui, sans-serif`
- Light theme: `--background: #ffffff`, `--foreground: #000000`, `--primary: #000000`, `--muted: #efefef`, `--muted-foreground: #4b4b4b`, `--border: #000000`
- Dark theme: `--background: #000000`, `--foreground: #ffffff`, `--primary: #ffffff`, `--muted: #1a1a1a`, `--muted-foreground: #afafaf`, `--border: #ffffff`
- Radius: `--radius: 0.5rem` (derived sizes: sm, md, lg, xl)

### 1.6 Infrastructure Files

| File | Purpose |
|---|---|
| `lib/supabase/client.ts` | `createBrowserClient()` with env vars |
| `lib/supabase/server.ts` | `createServerClient()` with cookie store |
| `lib/supabase/admin.ts` | `createClient()` with service role key, no RLS |
| `lib/supabase/middleware.ts` | Session refresh + RBAC redirect logic |
| `middleware.ts` | Entry point, delegates to `updateSession()` |
| `lib/utils.ts` | `cn()`, `isLockedByOther()`, `timeAgo()` |
| `lib/types/database.ts` | TS interfaces: `Profile`, `RubricSection`, `RubricCriterion`, `Proposal`, `Evaluation`, `ProposalAssignment`, form types |

### 1.7 Database Schema (Post-Migration 008)

#### `profiles`
| Column | Type | Constraints |
|---|---|---|
| id | UUID PK | References `auth.users(id)` ON DELETE CASCADE |
| full_name | TEXT | NOT NULL |
| role | TEXT | NOT NULL, CHECK `IN ('admin','evaluator')` |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |

Trigger: `on_auth_user_created` → `handle_new_user()` auto-creates profile from `raw_user_meta_data`.

#### `rubric_sections`
| Column | Type | Constraints |
|---|---|---|
| id | UUID PK | DEFAULT uuid_generate_v4() |
| name | TEXT | NOT NULL |
| total_marks | INT | NOT NULL |
| order_index | INT | NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |

#### `rubric_criteria`
| Column | Type | Constraints |
|---|---|---|
| id | UUID PK | DEFAULT uuid_generate_v4() |
| section_id | UUID FK | → rubric_sections(id) ON DELETE CASCADE |
| name | TEXT | NOT NULL |
| description | TEXT | NOT NULL |
| max_score | INT | NOT NULL |
| grading_bands | JSONB | NOT NULL DEFAULT '[]' |
| order_index | INT | NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |

Index: `idx_rubric_criteria_section(section_id)`

#### `proposals`
| Column | Type | Constraints |
|---|---|---|
| id | UUID PK | DEFAULT uuid_generate_v4() |
| team_name | TEXT | NOT NULL |
| product_name | TEXT | NOT NULL |
| description | TEXT | NOT NULL DEFAULT '' |
| proposal_url | TEXT | NOT NULL DEFAULT '' |
| video_url | TEXT | NOT NULL DEFAULT '' |
| total_score | INT | NOT NULL DEFAULT 0 |
| is_graded | BOOLEAN | NOT NULL DEFAULT false |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |

**Note**: `assigned_to`, `locked_by`, `locked_at` were dropped in migration 008.

#### `evaluations`
| Column | Type | Constraints |
|---|---|---|
| id | UUID PK | DEFAULT uuid_generate_v4() |
| proposal_id | UUID FK | → proposals(id) ON DELETE CASCADE |
| evaluator_id | UUID FK | → auth.users(id) ON DELETE CASCADE |
| rubric_criterion_id | UUID FK | → rubric_criteria(id) ON DELETE CASCADE |
| score | INT | NOT NULL DEFAULT 0, CHECK >= 0 |
| notes | TEXT | NOT NULL DEFAULT '' |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |

UNIQUE: `(proposal_id, evaluator_id, rubric_criterion_id)`
Indexes: `proposal_id`, `evaluator_id`, `rubric_criterion_id`

#### `proposal_assignments`
| Column | Type | Constraints |
|---|---|---|
| proposal_id | UUID | FK → proposals(id) ON DELETE CASCADE |
| evaluator_id | UUID | FK → auth.users(id) ON DELETE CASCADE |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |

PK: `(proposal_id, evaluator_id)`

#### RPC: `submit_evaluation(p_proposal_id UUID, p_evaluations JSONB)`
- SECURITY DEFINER, bypasses RLS
- Validates assignment via `proposal_assignments`
- Upserts evaluations with ON CONFLICT
- Calculates average total across all evaluators
- Updates `proposals.total_score` and `is_graded = true`

#### RLS Summary
- **profiles**: Admin full access; all authenticated can SELECT
- **rubric_sections/criteria**: Admin full; evaluator SELECT
- **proposals**: Admin full; evaluator SELECT only (no UPDATE — handled by RPC)
- **evaluations**: Admin full; all authenticated SELECT; evaluator INSERT/UPDATE own
- **proposal_assignments**: All authenticated SELECT; admin full manage

### 1.8 Rubric Structure (Seeded Data)

**Section 1: Proposal (70 marks, 8 criteria)**
1. Problem Definition — max 10
2. Analysis — max 10
3. Solution — max 10
4. Product Overview & Uniqueness — max 10
5. Business Model & Marketing Plan — max 10
6. Technical Overview & Implementation — max 10
7. User Scenario — max 6
8. Conclusion — max 4

**Section 2: Pitch Video (30 marks, 3 criteria)**
1. Hook & Problem Framing — max 8
2. Solution & Business Case — max 14
3. Delivery, Confidence & Pacing — max 8

### 1.9 Data Fetching Patterns

**Pattern**: Server Component fetches via `createClient()` (server) → passes data as props to `"use client"` component.

- **Admin dashboard** (`app/admin/page.tsx` L7-36): `Promise.all` fetches proposals, evaluations (with joined rubric_criteria), evaluator profiles, and assignments. Server-side builds `breakdownData` (averaged scores per criterion per proposal) and `evaluatorByProposal` (proposal → evaluator names array).
- **Evaluator dashboard** (`app/evaluator/page.tsx` L14-42): Same pattern but also computes `gradedProposalIds` (current user's graded proposals) and filters `breakdownData` to only the current evaluator's scores (last-write-wins dedup).
- **Evaluate page** (`app/evaluator/evaluate/[id]/page.tsx`): Fetches proposal, assignment check, rubric sections with criteria, existing evaluations for current user. Hard redirect if not assigned.
- **Client-side mutations**: Use `createClient()` (browser) for `supabase.rpc("submit_evaluation", ...)`, `supabase.from(...).insert/upsert/delete`.
- **State management**: `useState` + `useMemo` for search, filtering, computed stats. No global state store.

### 1.10 Evaluation & Scoring Logic

#### Submission Flow (`EvaluationViewClient`, `app/evaluator/evaluate/[id]/client.tsx`)
1. Existing evaluations pre-populate `scores` and `notes` state maps (keyed by `rubric_criterion_id`)
2. `handleScoreChange` clamps value to `[0, max_score]`
3. `totalScore` = `Object.values(scores).reduce(sum)`
4. On submit: validates all criteria have scores → builds `evaluationRows` array → calls `supabase.rpc("submit_evaluation", { p_proposal_id, p_evaluations })` — note: **does NOT pass `p_total_score`** (the RPC calculates it server-side)
5. `isAlreadyGraded` flag toggles between view mode (read-only) and edit mode with confirmation dialogs

#### Score Aggregation (RPC `submit_evaluation` in migration 008)
- Upserts per-criterion scores for the current evaluator
- Then: `WITH evaluator_totals AS (SELECT evaluator_id, SUM(score) FROM evaluations WHERE proposal_id = ... GROUP BY evaluator_id) SELECT ROUND(AVG(total))` → stored as `proposals.total_score`
- This means `total_score` is the **average across all evaluators who submitted**

#### Breakdown Display
- **Admin**: Groups all evaluators' scores per criterion, averages them per criterion
- **Evaluator**: Shows only the current user's own scores per criterion (deduped, last-write-wins)
- Both build `evaluatorByProposal: Record<string, string[]>` mapping proposal → evaluator full_names

#### Band Color Logic (`getBandColor` in evaluate client, L50-57)
- Pattern-matches grading band text (e.g., "Excellent" → green, "Good" → blue, "Average" → yellow, "Poor" → red)

---

## 2. PERFORMANCE AUDIT

### 2.1 Middleware: Redundant Profile Queries

**File**: `lib/supabase/middleware.ts` L32-89
**Issue**: Up to 3 separate `profiles` queries per request (login redirect L52, admin guard L65, root redirect L80). Each is a full DB round-trip.
**Fix**: Query profile once after `getUser()` succeeds, cache the result for all subsequent checks:
```typescript
// After L34: const { data: { user } } = await supabase.auth.getUser();
let profile: { role: string } | null = null;
if (user) {
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  profile = data;
}
// Then use `profile` in all three conditional blocks below
```

### 2.2 Admin Dashboard: O(n²) Evaluator Name Lookup

**File**: `app/admin/page.tsx` L77-85
**Issue**: For each evaluation, `evaluators.find(p => p.id === ev.evaluator_id)` is O(n) per evaluation. With 50 proposals × 11 criteria × 3 evaluators = 1650 iterations × evaluator list scan.
**Fix**: Pre-build a `Map<string, string>` from evaluator ID → name before the loop:
```typescript
const evaluatorNameMap = new Map(evaluators.map(e => [e.id, e.full_name]));
// Then: const name = evaluatorNameMap.get(ev.evaluator_id);
```

### 2.3 Evaluator Dashboard: Same O(n²) Pattern

**File**: `app/evaluator/page.tsx` L84-92
**Same fix** as 2.2 — build a Map before iterating.

### 2.4 Assignments Client: Repeated `.find()` in Render Loop

**File**: `app/admin/assignments/client.tsx` L306-307
**Issue**: Inside `filteredProposals.map()`, for each assignee ID: `evaluators.find(ev => ev.id === id)`. Runs on every render.
**Fix**: Memoize evaluator lookup map:
```typescript
const evaluatorMap = useMemo(() => new Map(evaluators.map(e => [e.id, e])), [evaluators]);
```

### 2.5 Evaluator Client: Repeated `.find()` in All Proposals Table

**File**: `app/evaluator/client.tsx` L490
**Issue**: `profiles.find(p => p.id === id)` inside render for every assignee of every proposal.
**Fix**: Same memoized Map pattern.

### 2.6 Admin Dashboard: `evaluations` RLS Fetches ALL Evaluations

**File**: `app/admin/page.tsx` L19-28, `app/evaluator/page.tsx` L26-35
**Issue**: Both pages fetch `evaluations` with no filter on `proposal_id`. As the system scales, this returns the entire evaluations table.
**Fix**: For evaluator page, filter by `evaluator_id` server-side: `.eq("evaluator_id", user.id)` for the breakdown query. For admin, this is acceptable since admins need all data.

### 2.7 No `revalidate` or Caching Strategy

**File**: All server component pages
**Issue**: Every page load triggers fresh Supabase queries. No ISR or cache tags.
**Fix**: For the evaluation event context (short-lived, concurrent writes), this is actually correct — stale data would be worse. **No change recommended** unless the event scales beyond ~100 proposals.

### 2.8 Google Fonts Loaded in `<head>` Without `next/font`

**File**: `app/layout.tsx` L24-27
**Issue**: Inter is loaded via a `<link>` tag AND via `Geist` from `next/font/google`. Duplicate font loading.
**Fix**: Remove the manual `<link>` tag. Use only `next/font/google` for Inter:
```typescript
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
```
Remove lines 24-27 (the `<link>` tag).

### 2.9 `loginimage.jpg` (264KB) Duplicated

**File**: Root `loginimage.jpg` (264KB) AND `public/loginimage.jpg` (264KB)
**Issue**: Same file exists in both root and public. `next/image` references `/loginimage.jpg` which resolves to `public/`.
**Fix**: Delete the root-level copy.

---

## 3. FUNCTIONAL UPGRADE SPECIFICATION

### 3.1 PDF Rendering & Annotation

#### Chosen Renderer: `react-pdf` (v10.4.1) + `pdfjs-dist` (v5.7.284)

**Justification**: Both are already installed in `package.json`. `react-pdf` provides `<Document>` and `<Page>` React components that wrap `pdfjs-dist`. The `react-pdf-highlighter` (v8.0.0-rc.0) is also installed and provides text selection → highlight creation out of the box, but it is an RC release. **Decision**: Use `react-pdf` for rendering and build a custom lightweight annotation layer on top, avoiding the unstable `react-pdf-highlighter` RC. If the RC proves stable during implementation, it can be swapped in.

#### CORS Strategy for Google Drive PDFs

Google Drive blocks cross-origin PDF fetching. The `app/api/proxy/pdf/` directory already exists (empty).

**Implementation**:
1. Create `app/api/proxy/pdf/route.ts`:
   - Accept `GET ?url=<encoded-drive-url>`
   - Validate the caller is authenticated (check Supabase session)
   - Transform Google Drive share URLs to direct download format: `https://drive.google.com/uc?export=download&id=<FILE_ID>`
   - Fetch the PDF server-side with `fetch()`, stream the response back with `Content-Type: application/pdf`
   - Set `Cache-Control: private, max-age=3600` to avoid re-fetching
   - Rate-limit: max 10 requests per minute per user (simple in-memory counter)

2. Client usage: `<Document file={`/api/proxy/pdf?url=${encodeURIComponent(proposal.proposal_url)}`} />`

#### Database Schema for Annotations

**New migration**: `supabase/migrations/009_annotations.sql`

```sql
CREATE TABLE public.pdf_annotations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id     UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  evaluator_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page_number     INT NOT NULL,
  start_offset    INT NOT NULL,          -- character offset from start of page text
  end_offset      INT NOT NULL,          -- character offset end
  rect_x          FLOAT NOT NULL,        -- bounding rect x (% of page width, 0-100)
  rect_y          FLOAT NOT NULL,        -- bounding rect y (% of page height, 0-100)
  rect_width      FLOAT NOT NULL,        -- width as % of page
  rect_height     FLOAT NOT NULL,        -- height as % of page
  color           TEXT NOT NULL DEFAULT '#FFEB3B',  -- highlight color hex
  comment         TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT check_page_positive CHECK (page_number > 0),
  CONSTRAINT check_offsets CHECK (end_offset >= start_offset)
);

CREATE INDEX idx_annotations_proposal ON public.pdf_annotations(proposal_id);
CREATE INDEX idx_annotations_evaluator ON public.pdf_annotations(evaluator_id);

ALTER TABLE public.pdf_annotations ENABLE ROW LEVEL SECURITY;

-- All authenticated can read annotations for proposals they can see
CREATE POLICY "annotations_select"
  ON public.pdf_annotations FOR SELECT TO authenticated
  USING ((SELECT public.get_user_role()) IN ('admin', 'evaluator'));

-- Evaluators can only create/edit/delete their own annotations
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
```

**Position storage**: Dual system — `page_number` + `start_offset/end_offset` (character offsets for text re-selection) AND `rect_*` (percentage-based bounding box for visual rendering regardless of zoom). The character offsets allow re-highlighting when text layer is available. The rect values provide fallback positioning.

**Multi-evaluator visibility**: All evaluators can READ all annotations (RLS policy `annotations_select`). Each evaluator can only CREATE/UPDATE/DELETE their own. The UI should color-code annotations by evaluator (each evaluator gets a distinct color from a predefined palette).

#### TypeScript Types

Add to `lib/types/database.ts`:
```typescript
export interface PdfAnnotation {
  id: string;
  proposal_id: string;
  evaluator_id: string;
  page_number: number;
  start_offset: number;
  end_offset: number;
  rect_x: number;
  rect_y: number;
  rect_width: number;
  rect_height: number;
  color: string;
  comment: string;
  created_at: string;
  updated_at: string;
}
```

#### Component Tree for Annotation System

```
PdfAnnotationPanel (new component)
├── PdfToolbar
│   ├── PageNavigation (prev/next, page input)
│   ├── ZoomControls (fit-width, zoom in/out)
│   └── HighlightToggle (enable/disable annotation mode)
├── PdfViewer (wraps react-pdf <Document> + <Page>)
│   ├── AnnotationLayer (absolute overlay per page)
│   │   └── HighlightRect[] (positioned divs with click → comment popover)
│   └── TextSelectionHandler (mouseup → create annotation)
└── AnnotationSidebar
    ├── AnnotationCard[] (grouped by page, shows evaluator name, comment, timestamp)
    └── AnnotationForm (comment input + save/cancel for new/edit)
```

**State management**: Local `useState` for active annotations list, current page, zoom level, pending selection. Supabase client for CRUD. Optimistic updates: add annotation to local state immediately, sync to DB, rollback on error.

### 3.2 Video Timestamp System

#### YouTube iframe API Integration

**Approach**: Use `react-youtube` (v10.1.0, already installed). It wraps the YouTube IFrame Player API.

```typescript
import YouTube, { YouTubeEvent } from 'react-youtube';

// Extract video ID from various YouTube URL formats
function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&\s?]+)/);
  return match?.[1] ?? null;
}
```

The `onReady` event provides the player instance. Use `player.getCurrentTime()` to capture timestamp when creating a comment. Use `player.seekTo(seconds)` to jump to a timestamp when clicking a comment.

#### Database Schema for Timestamp Comments

```sql
CREATE TABLE public.video_comments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id     UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  evaluator_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp_secs  FLOAT NOT NULL,         -- seconds into the video
  comment         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT check_timestamp_positive CHECK (timestamp_secs >= 0)
);

CREATE INDEX idx_video_comments_proposal ON public.video_comments(proposal_id);
CREATE INDEX idx_video_comments_evaluator ON public.video_comments(evaluator_id);

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
```

#### Watched Threshold Tracking

Track how much of the video the evaluator has watched. Use `onStateChange` events from `react-youtube` to track play/pause intervals. Store in `localStorage` keyed by `proposalId_evaluatorId` (no DB table needed — this is a soft UI indicator, not a hard requirement).

```typescript
// localStorage key: `watched_${proposalId}_${evaluatorId}`
// Value: JSON array of [startSec, endSec] intervals
// Merge overlapping intervals to calculate total unique seconds watched
// Display as a progress bar: (total unique seconds / video duration) * 100
```

#### Component Tree for Video Panel

```
VideoPanel (new component)
├── YouTubePlayer (react-youtube wrapper)
│   └── ProgressOverlay (watched segments visualized on scrubber)
├── VideoToolbar
│   ├── AddTimestampButton (captures current time)
│   └── WatchedIndicator (% watched badge)
└── TimestampCommentsList
    ├── TimestampComment[] (sorted by timestamp_secs)
    │   ├── TimestampBadge (clickable → seekTo)
    │   ├── CommentText
    │   └── EvaluatorPill (name + color)
    └── NewCommentForm (timestamp auto-filled, comment input)
```

### 3.3 Evaluator View Layout

#### Layout Decision: **Tabbed Interface** with Side Panel

**Rationale**: The evaluate page currently stacks rubric sections vertically in a single column. The upgrade adds PDF and video viewers. Side-by-side splits would be too narrow on tablets. A tabbed approach keeps each view full-width.

**Breakpoints**:
- **Mobile (< 768px)**: Full-width stacked. Tabs at top: "Rubric" | "Document" | "Video". Only one visible at a time.
- **Tablet (768px–1279px)**: Same tabbed approach but with more horizontal space for content.
- **Desktop (≥ 1280px)**: Split view — left panel (60%) shows PDF or Video (tab-switchable), right panel (40%) shows rubric scoring form. The rubric scrolls independently.

#### Component Tree for Full Evaluator View

```
EvaluationViewClient (refactored, app/evaluator/evaluate/[id]/client.tsx)
├── EvalHeader (proposal name, team, description, back button)
├── ScoreProgressBar (sticky, unchanged)
├── EvalLayoutShell
│   ├── [Desktop ≥ 1280px] SplitView
│   │   ├── LeftPanel (resizable, 60% default)
│   │   │   ├── MediaTabs ("Document" | "Video")
│   │   │   ├── PdfAnnotationPanel (when Document tab active)
│   │   │   └── VideoPanel (when Video tab active)
│   │   └── RightPanel (40%, scrollable)
│   │       └── RubricForm (existing rubric sections + criteria)
│   └── [Mobile/Tablet < 1280px] TabbedView
│       ├── TabBar ("Rubric" | "Document" | "Video")
│       ├── RubricForm (when Rubric tab active)
│       ├── PdfAnnotationPanel (when Document tab active)
│       └── VideoPanel (when Video tab active)
├── GlobalNotes (unchanged)
└── ActionBar (fixed bottom, unchanged)
```

---

## 4. DESIGN TOKEN SYSTEM

### 4.1 Implementation Method

**CSS custom properties** in `app/globals.css`, consumed via Tailwind v4's `@theme inline` block. This is the existing pattern — no change in approach.

### 4.2 Complete Token Architecture

All values derived from `DESIGN.md`. Tokens use `--uber-*` prefix to distinguish from shadcn's `--*` defaults.

#### Color Tokens (add to `:root` and `.dark` in `globals.css`)

```css
:root {
  /* Existing shadcn tokens remain unchanged */

  /* Uber Design System Tokens */
  --uber-black: #000000;
  --uber-white: #ffffff;
  --uber-hover-gray: #e2e2e2;
  --uber-hover-light: #f3f3f3;
  --uber-chip-gray: #efefef;
  --uber-body-gray: #4b4b4b;
  --uber-muted-gray: #afafaf;
  --uber-shadow-light: 0px 4px 16px rgba(0, 0, 0, 0.12);
  --uber-shadow-medium: 0px 4px 16px rgba(0, 0, 0, 0.16);
  --uber-shadow-floating: 0px 2px 8px rgba(0, 0, 0, 0.16);
  --uber-shadow-pressed: inset 0px 0px 0px 999px rgba(0, 0, 0, 0.08);
  --uber-focus-ring: inset 0px 0px 0px 2px rgb(255, 255, 255);
  --uber-link-blue: #0000ee;
}

.dark {
  /* In dark mode, invert the core pair */
  --uber-black: #ffffff;
  --uber-white: #000000;
  --uber-hover-gray: #1a1a1a;
  --uber-hover-light: #111111;
  --uber-chip-gray: #1a1a1a;
  --uber-body-gray: #afafaf;
  --uber-muted-gray: #4b4b4b;
  --uber-shadow-light: 0px 4px 16px rgba(255, 255, 255, 0.06);
  --uber-shadow-medium: 0px 4px 16px rgba(255, 255, 255, 0.08);
  --uber-shadow-floating: 0px 2px 8px rgba(255, 255, 255, 0.08);
  --uber-shadow-pressed: inset 0px 0px 0px 999px rgba(255, 255, 255, 0.08);
  --uber-focus-ring: inset 0px 0px 0px 2px rgb(0, 0, 0);
  --uber-link-blue: #6699ff;
}
```

#### Typography Tokens

```css
:root {
  --uber-font-heading: "Inter", system-ui, "Helvetica Neue", Arial, sans-serif;
  --uber-font-body: "Inter", system-ui, "Helvetica Neue", Arial, sans-serif;

  --uber-text-display: 3.25rem;    /* 52px */
  --uber-text-section: 2.25rem;    /* 36px */
  --uber-text-card-title: 2rem;    /* 32px */
  --uber-text-subheading: 1.5rem;  /* 24px */
  --uber-text-small-heading: 1.25rem; /* 20px */
  --uber-text-nav: 1.125rem;       /* 18px */
  --uber-text-body: 1rem;          /* 16px */
  --uber-text-caption: 0.875rem;   /* 14px */
  --uber-text-micro: 0.75rem;      /* 12px */

  --uber-leading-display: 1.23;
  --uber-leading-section: 1.22;
  --uber-leading-card: 1.25;
  --uber-leading-sub: 1.33;
  --uber-leading-body: 1.50;
  --uber-leading-caption: 1.43;
  --uber-leading-micro: 1.67;

  --uber-weight-bold: 700;
  --uber-weight-medium: 500;
  --uber-weight-regular: 400;
}
```

#### Spacing Tokens

```css
:root {
  --uber-space-1: 4px;
  --uber-space-1-5: 6px;
  --uber-space-2: 8px;
  --uber-space-2-5: 10px;
  --uber-space-3: 12px;
  --uber-space-3-5: 14px;
  --uber-space-4: 16px;
  --uber-space-4-5: 18px;
  --uber-space-5: 20px;
  --uber-space-6: 24px;
  --uber-space-8: 32px;
  --uber-space-section: 64px;
}
```

#### Border Radius Tokens

```css
:root {
  --uber-radius-card: 8px;
  --uber-radius-featured: 12px;
  --uber-radius-pill: 999px;
  --uber-radius-circle: 50%;
  --uber-radius-input: 8px;
}
```

#### Layout Tokens

```css
:root {
  --uber-container-max: 1136px;
  --uber-breakpoint-mobile: 320px;
  --uber-breakpoint-mobile-lg: 600px;
  --uber-breakpoint-tablet-sm: 768px;
  --uber-breakpoint-tablet: 1119px;
  --uber-breakpoint-desktop-sm: 1120px;
  --uber-breakpoint-desktop: 1136px;
}
```

### 4.3 Tailwind v4 Theme Integration

Add to the `@theme inline` block in `globals.css`:

```css
@theme inline {
  /* existing tokens... */
  --shadow-uber-light: var(--uber-shadow-light);
  --shadow-uber-medium: var(--uber-shadow-medium);
  --shadow-uber-floating: var(--uber-shadow-floating);
  --radius-pill: var(--uber-radius-pill);
  --radius-card: var(--uber-radius-card);
  --radius-featured: var(--uber-radius-featured);
}
```

This enables usage like `shadow-uber-light`, `rounded-pill`, `rounded-card` in Tailwind classes.

---

## 5. COMPONENT REBUILD SPECIFICATION

### Component Inventory & Rebuild Assignments

#### `Navbar` — `components/navbar.tsx`
- **Props**: `fullName: string, role: UserRole` (unchanged)
- **Tokens**: `--uber-black` bg, `--uber-white` text, `--uber-radius-pill` for avatar, `--uber-shadow-light` for dropdown, `--uber-font-body` at `--uber-text-caption` weight 500
- **States**: Default, dropdown-open, mobile-collapsed
- **Motion**: Dropdown fade-in (existing `animate-in fade-in-80 zoom-in-95`)
- **Complexity**: LOW

#### `Sidebar` — `components/sidebar.tsx`
- **Props**: none (unchanged)
- **Tokens**: `--uber-chip-gray` for bg, `--uber-black`/`--uber-white` for active link pill, `--uber-radius-pill` for active indicator
- **States**: Default, active-link, hover
- **Motion**: None currently, add subtle hover background transition
- **Complexity**: LOW

#### `ThemeToggle` — `components/theme-toggle.tsx`
- **Props**: none (unchanged)
- **Tokens**: `--uber-radius-circle` for button, `--uber-hover-gray` on hover
- **States**: Light mode, dark mode
- **Motion**: Existing sun/moon rotation transition
- **Complexity**: LOW

#### `LoginPage` — `app/login/page.tsx`
- **Props**: none (page component)
- **Tokens**: `--uber-black` for CTA button, `--uber-white` bg, `--uber-text-card-title` for h1, `--uber-radius-pill` for submit button, `--uber-radius-input` for form fields
- **States**: Default, loading (spinner), error (toast)
- **Motion**: None needed
- **Complexity**: MEDIUM (responsive two-column layout)

#### `AdminDashboardClient` — `app/admin/client.tsx`
- **Props**: unchanged (see §1.4)
- **Tokens**: Card uses `--uber-shadow-light`, `--uber-radius-card`. Badge uses `--uber-radius-pill`. Stats use `--uber-text-subheading` for values
- **States**: Empty (no proposals), loading (parent loading.tsx), populated, search-filtered
- **Motion**: None
- **Complexity**: MEDIUM

#### `EvaluatorDashboardClient` — `app/evaluator/client.tsx`
- **Props**: unchanged (see §1.4)
- **Tokens**: Same as admin dashboard tokens
- **States**: Empty, populated, search-filtered, navigating-to-evaluate (pulse badge)
- **Motion**: Pulse animation on "Entering..." badge
- **Complexity**: MEDIUM

#### `EvaluationViewClient` — `app/evaluator/evaluate/[id]/client.tsx`
- **Props**: unchanged + new: `annotations: PdfAnnotation[]`, `videoComments: VideoComment[]`
- **Tokens**: All card/badge/button tokens, `--uber-shadow-medium` for sticky progress bar, `--uber-radius-card` for rubric sections
- **States**: View-only, editing, submitting, confirmation-dialog
- **Motion**: None existing; add smooth panel resize on desktop
- **Complexity**: HIGH (major refactor for split-view + PDF + video)

#### `PdfAnnotationPanel` — `components/pdf-annotation-panel.tsx` [NEW]
- **Props**: `proposalUrl: string, proposalId: string, evaluatorId: string, evaluatorName: string, annotations: PdfAnnotation[]`
- **Tokens**: `--uber-shadow-light` for annotation cards, `--uber-radius-card`, `--uber-chip-gray` for toolbar bg
- **States**: Loading PDF, loaded, error, annotation-mode-on, annotation-mode-off, creating-annotation
- **Motion**: Highlight pulse on new annotation creation
- **Complexity**: HIGH

#### `VideoPanel` — `components/video-panel.tsx` [NEW]
- **Props**: `videoUrl: string, proposalId: string, evaluatorId: string, evaluatorName: string, comments: VideoComment[]`
- **Tokens**: `--uber-radius-card` for comment cards, `--uber-chip-gray` for timestamp badge bg
- **States**: Loading, playing, paused, adding-comment
- **Motion**: Scroll-to-comment on timestamp click
- **Complexity**: HIGH

#### `EvaluatorsClient` — `app/admin/evaluators/client.tsx`
- **Props**: `profiles: Profile[]` (unchanged)
- **Tokens**: Standard card/table/badge tokens
- **States**: Default, creating-account (spinner), success (toast)
- **Complexity**: LOW

#### `UploadProposalsPage` — `app/admin/proposals/page.tsx`
- **Props**: none (page component)
- **Tokens**: Standard card/input/button tokens
- **States**: Default, uploading-single, uploading-bulk, success
- **Complexity**: LOW

#### `AssignmentsClient` — `app/admin/assignments/client.tsx`
- **Props**: unchanged
- **Tokens**: Standard card/table/badge tokens, `--uber-shadow-light` for floating bulk action bar
- **States**: Default, bulk-selected, assigning, dialog-open
- **Motion**: `slide-in-from-bottom-4` on bulk action bar (existing)
- **Complexity**: MEDIUM

#### Loading Pages (3 files)
- **Complexity**: LOW each — apply token colors to spinner

#### Error Pages [NEW] — `app/error.tsx`, `app/not-found.tsx`
- **Complexity**: LOW — simple error message + back button

### Batch Assignments

**BATCH A (Opus)** — Token foundation, global base, shared primitives, auth, complex evaluation, PDF, video:
1. `app/globals.css` — Add all design tokens
2. `components/ui/button.tsx` — Verify pill radius, hover colors match tokens
3. `components/ui/card.tsx` — Verify shadow matches tokens
4. `components/ui/badge.tsx` — Verify pill radius
5. `app/login/page.tsx` — Rebuild with tokens
6. `components/navbar.tsx` — Rebuild with tokens
7. `app/evaluator/evaluate/[id]/client.tsx` — Major refactor for split-view layout
8. `components/pdf-annotation-panel.tsx` [NEW] — Full PDF viewer + annotation system
9. `components/video-panel.tsx` [NEW] — Full video player + timestamp comments
10. `app/api/proxy/pdf/route.ts` [NEW] — PDF proxy API
11. `supabase/migrations/009_annotations_and_video.sql` [NEW] — Both new tables
12. `lib/types/database.ts` — Add PdfAnnotation, VideoComment types

**BATCH B (Sonnet)** — Internal dashboards, data display, forms:
1. `app/admin/client.tsx` — Apply tokens, performance fixes
2. `app/evaluator/client.tsx` — Apply tokens, performance fixes
3. `app/admin/evaluators/client.tsx` — Apply tokens
4. `app/admin/proposals/page.tsx` — Apply tokens
5. `app/admin/assignments/client.tsx` — Apply tokens
6. `components/sidebar.tsx` — Apply tokens
7. `lib/supabase/middleware.ts` — Performance fix (single profile query)
8. `app/evaluator/evaluate/[id]/page.tsx` — Pass new annotation/video data

**BATCH C (Haiku or Sonnet)** — Repetitive, simple:
1. `app/admin/loading.tsx` — Apply tokens
2. `app/evaluator/loading.tsx` — Apply tokens
3. `app/evaluator/evaluate/[id]/loading.tsx` — Apply tokens
4. `app/error.tsx` [NEW] — Error page
5. `app/not-found.tsx` [NEW] — 404 page
6. `app/layout.tsx` — Fix font loading (remove `<link>` tag)
7. `components/theme-toggle.tsx` — Apply tokens
8. Delete root-level `loginimage.jpg`

---

## 6. EXECUTION CHECKLIST

```
- [x] Add Uber design tokens to globals.css — BATCH: A — FILE: app/globals.css — STATUS: done (2026-04-29T01:27)
  Completed: Added all --uber-* tokens (colors, shadows, typography, spacing, radii, layout) to both :root and .dark blocks. Existing shadcn tokens preserved.
- [x] Add Tailwind v4 theme integration for custom tokens — BATCH: A — FILE: app/globals.css — STATUS: done (2026-04-29T01:27)
  Completed: Added shadow-uber-light, shadow-uber-medium, shadow-uber-floating, radius-pill, radius-card, radius-featured to @theme inline block.
- [x] Verify/update Button pill radius and hover tokens — BATCH: A — FILE: components/ui/button.tsx — STATUS: done (2026-04-29T01:30)
  Completed: Verified — already uses rounded-full (pill), hover #e2e2e2 / dark #1a1a1a matching --uber-hover-gray. No changes needed.
- [x] Verify/update Card shadow tokens — BATCH: A — FILE: components/ui/card.tsx — STATUS: done (2026-04-29T01:30)
  Completed: Verified — already uses shadow-[0px_4px_16px_rgba(0,0,0,0.12)] matching --uber-shadow-light, ring-1 ring-foreground/10. No changes needed.
- [x] Verify/update Badge pill radius — BATCH: A — FILE: components/ui/badge.tsx — STATUS: done (2026-04-29T01:30)
  Completed: Verified — already uses rounded-full (pill). No changes needed.
- [x] Add PdfAnnotation and VideoComment types — BATCH: A — FILE: lib/types/database.ts — STATUS: done (2026-04-29T01:28)
  Completed: Added PdfAnnotation (14 fields) and VideoComment (7 fields) interfaces after ProposalAssignment.
- [x] Create SQL migration for pdf_annotations and video_comments tables — BATCH: A — FILE: supabase/migrations/009_annotations_and_video.sql — STATUS: done (2026-04-29T01:28)
  Completed: Single migration with both tables, indexes, RLS policies matching spec. Added COMMENT ON TABLE. Supersedes the old empty 009_evaluator_annotations.sql.
- [x] Build PDF proxy API route — BATCH: A — FILE: app/api/proxy/pdf/route.ts — STATUS: done (2026-04-29T01:29)
  Completed: GET route with Supabase auth, rate limiting (10/min in-memory), Google Drive ID extraction (multiple URL formats), server-side fetch + stream back with Cache-Control.
- [x] Build PdfAnnotationPanel component — BATCH: A — FILE: components/pdf-annotation-panel.tsx — STATUS: done (2026-04-29T01:30)
  Completed: Full component with react-pdf Document/Page, drag-to-select annotation overlay, evaluator color-coding, optimistic CRUD, annotation list sidebar. Uses pdfjs worker from unpkg CDN.
- [x] Build VideoPanel component — BATCH: A — FILE: components/video-panel.tsx — STATUS: done (2026-04-29T01:31)
  Completed: Full component with react-youtube, timestamp capture/seek, optimistic comment CRUD, evaluator color-coding, sorted comment list. Decided against localStorage watched-threshold tracking for MVP — can be added later.
- [x] Rebuild login page with design tokens — BATCH: A — FILE: app/login/page.tsx — STATUS: done (2026-04-29T01:31)
- [x] Rebuild navbar with design tokens — BATCH: A — FILE: components/navbar.tsx — STATUS: done (2026-04-29T01:32)
- [x] Refactor EvaluationViewClient for split-view layout — BATCH: A — FILE: app/evaluator/evaluate/[id]/client.tsx — STATUS: done (2026-04-29T01:33)
- [x] Update evaluate server page to pass annotations and video comments — BATCH: B — FILE: app/evaluator/evaluate/[id]/page.tsx — STATUS: done (2026-04-29T01:45)
- [x] Apply tokens + perf fixes to AdminDashboardClient — BATCH: B — FILE: app/admin/client.tsx — STATUS: done (2026-04-29T01:45)
- [x] Apply tokens + perf fixes to admin server page — BATCH: B — FILE: app/admin/page.tsx — STATUS: done (2026-04-29T01:45)
- [x] Apply tokens + perf fixes to EvaluatorDashboardClient — BATCH: B — FILE: app/evaluator/client.tsx — STATUS: done (2026-04-29T01:45)
- [x] Apply tokens + perf fixes to evaluator server page — BATCH: B — FILE: app/evaluator/page.tsx — STATUS: done (2026-04-29T01:45)
- [x] Apply tokens to EvaluatorsClient — BATCH: B — FILE: app/admin/evaluators/client.tsx — STATUS: done (2026-04-29T01:45)
- [x] Apply tokens to UploadProposalsPage — BATCH: B — FILE: app/admin/proposals/page.tsx — STATUS: done (2026-04-29T01:45)
- [x] Apply tokens to AssignmentsClient — BATCH: B — FILE: app/admin/assignments/client.tsx — STATUS: done (2026-04-29T01:45)
- [x] Apply tokens to Sidebar — BATCH: B — FILE: components/sidebar.tsx — STATUS: done (2026-04-29T01:45)
- [x] Fix middleware redundant profile queries — BATCH: B — FILE: lib/supabase/middleware.ts — STATUS: done (2026-04-29T01:45)
- [ ] Apply tokens to evaluate loading page — BATCH: C — FILE: app/evaluator/evaluate/[id]/loading.tsx — STATUS: pending
- [ ] Create error boundary page — BATCH: C — FILE: app/error.tsx — STATUS: pending
- [ ] Create 404 not-found page — BATCH: C — FILE: app/not-found.tsx — STATUS: pending
- [ ] Fix font loading (remove manual link tag, use next/font) — BATCH: C — FILE: app/layout.tsx — STATUS: pending
- [ ] Apply tokens to ThemeToggle — BATCH: C — FILE: components/theme-toggle.tsx — STATUS: pending
- [ ] Delete duplicate loginimage.jpg from root — BATCH: C — FILE: loginimage.jpg — STATUS: pending
- [x] Run npx tsc --noEmit to verify build — BATCH: ALL — STATUS: done (2026-04-29T01:40)
  Completed: Zero errors, zero warnings. Clean exit.
- [ ] Run npm run build to verify production build — BATCH: ALL — STATUS: pending
```

---

## 7. HANDOFF PROTOCOL

### For Every Model Picking Up This Document

#### 1. How to Read Your Assigned Batch
- Find your batch letter (A, B, or C) in the §6 Execution Checklist
- Read §5 Component Rebuild Specification for each component in your batch
- Read §4 Design Token System to understand every token value and how to use it
- Read §1 System Inventory for the file's current state, props, and behavior
- For Batch A: also read §3 Functional Upgrade Specification for PDF/Video/Layout details

#### 2. How to Mark Tasks Complete
- Change `- [ ]` to `- [x]` in §6 for each completed task
- Add a brief note after STATUS: e.g., `STATUS: done — added 12 tokens`
- If you created or modified files not listed, add a new line to the checklist

#### 3. What to NEVER Touch
- **Backend logic**: Do NOT modify the `submit_evaluation` RPC signature or behavior
- **Auth logic**: Do NOT modify `lib/supabase/middleware.ts` auth flow (redirect logic). Only optimize the profile query count
- **RLS policies**: Do NOT modify existing RLS policies in migrations 001-008
- **Evaluation scoring**: Do NOT change how scores are calculated, averaged, or stored
- **Database constraints**: Do NOT alter existing UNIQUE or CHECK constraints
- **Props interfaces**: Do NOT change existing component props — only ADD new optional props

#### 4. How to Update This Document
- If you make a design decision not covered here, add it under the relevant section with a `> DECISION (Batch X):` blockquote
- If you discover a new issue, add it to §2 Performance Audit with a `> FOUND (Batch X):` blockquote
- If a task is blocked, change STATUS to `blocked` and add a reason

#### 5. What to Do If Blocked or Ambiguous
- If a dependency from another batch is missing, mark your task as `blocked — waiting on [task description]`
- If DESIGN.md is ambiguous for a specific component, default to: black primary button, pill radius, whisper shadow, Inter font
- If a shadcn/ui component doesn't support a needed variant, extend it via `cva` — do NOT replace the component
- If `react-pdf` or `react-youtube` has API changes from the installed version, check the package's README in `node_modules/` and adapt accordingly
- The event name is always "ideasprint 2026" (lowercase, with space) — never "IdeaSprint", "ideaSprint", or "Ideasprint"

#### 6. Build Verification
After completing all tasks in your batch:
1. Run `npx tsc --noEmit` — must exit with code 0
2. Run `npm run build` — must succeed
3. Run `npm run dev` and manually verify the pages you modified render correctly
4. Check both light and dark modes

---

## 8. BATCH A SUMMARY

> Completed: 2026-04-29T01:40 IST by Batch A executor.

### What Was Built

| # | File | Type | Summary |
|---|---|---|---|
| 1 | `app/globals.css` | Modified | Added ~60 Uber design tokens (`--uber-*`) across colors, shadows, typography, spacing, radii, and layout. Both `:root` and `.dark` themes. Integrated into `@theme inline` block for Tailwind v4 utility-class usage (`shadow-uber-light`, `rounded-pill`, `rounded-card`, `rounded-featured`). |
| 2 | `components/ui/button.tsx` | Verified | Already compliant — `rounded-full`, hover `#e2e2e2` / dark `#1a1a1a`. No changes. |
| 3 | `components/ui/card.tsx` | Verified | Already compliant — `shadow-[0px_4px_16px_rgba(0,0,0,0.12)]`, `ring-1 ring-foreground/10`. No changes. |
| 4 | `components/ui/badge.tsx` | Verified | Already compliant — `rounded-full`. No changes. |
| 5 | `lib/types/database.ts` | Modified | Added `PdfAnnotation` (14 fields) and `VideoComment` (7 fields) interfaces. |
| 6 | `supabase/migrations/009_annotations_and_video.sql` | New | Combined migration: `pdf_annotations` table (page, character offsets, percentage-based rect) + `video_comments` table (timestamp_secs). Full RLS: authenticated SELECT, own INSERT/UPDATE/DELETE. Indexes on proposal_id and evaluator_id for both. |
| 7 | `app/api/proxy/pdf/route.ts` | New | Authenticated PDF proxy. Rate-limited (10 req/min, in-memory). Extracts Google Drive file IDs from `/d/ID/` and `?id=ID` patterns. Streams PDF back with `Cache-Control: private, max-age=3600`. |
| 8 | `components/pdf-annotation-panel.tsx` | New | Full PDF viewer + annotation system. Uses `react-pdf` v10 with pdfjs worker from unpkg CDN. Features: page navigation, zoom controls (in/out/fit-width), drag-to-select annotation creation, evaluator color-coded highlights, comment form, annotation list sidebar, optimistic CRUD via Supabase. |
| 9 | `components/video-panel.tsx` | New | YouTube video player + timestamp comments. Uses `react-youtube` v10. Features: video embed with controls, capture-current-time button, seekTo on timestamp click, comment form, sorted comment list with evaluator color pills, optimistic CRUD. |
| 10 | `app/login/page.tsx` | Rebuilt | Applied Uber tokens: `--uber-text-card-title` h1, `--uber-radius-pill` CTA, `--uber-radius-input` form fields, `--uber-body-gray` / `--uber-muted-gray` text. Responsive layout preserved. |
| 11 | `components/navbar.tsx` | Rebuilt | Applied `--uber-shadow-light` header, `--uber-shadow-medium` + `--uber-radius-card` dropdown, token typography for brand text. All existing logic preserved. |
| 12 | `app/evaluator/evaluate/[id]/client.tsx` | Major refactor | Desktop (≥1280px): `xl:grid xl:grid-cols-[3fr_2fr]` split — left panel shows PDF/Video via `<Tabs>`, right panel scrollable rubric. Mobile/Tablet: full-width tabbed interface (Rubric \| Document \| Video). New optional props: `annotations`, `videoComments`, `evaluatorName`. All scoring and submission logic preserved exactly. |

### Spec Deviations

| Decision | Deviation | Justification |
|---|---|---|
| Watched threshold tracking | **Deferred** — spec §3.2 calls for localStorage-based watched percentage | MVP scope: the timestamp comments system is the core feature; watched tracking is a polish item that can be added in a follow-up without any DB or API changes |
| PDF.js worker source | Using unpkg CDN (`//unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`) instead of local copy | Simpler setup, avoids `next.config.js` webpack changes for worker files. If offline support is needed, copy the worker to `/public/` and update the path |
| Annotation character offsets | `start_offset` and `end_offset` default to `0` for drag-created annotations | The drag-to-select approach captures bounding rectangles (percentage-based), not text-layer character positions. Text-layer selection can be added as an enhancement |
| `icon-xs` and `icon-sm` button sizes | Used in PdfAnnotationPanel and VideoPanel delete buttons | These variants already exist in `button.tsx` (lines 29-32). No new variants were added |

### Patterns and Token Usage for BATCH B and C Models

#### How to Apply Tokens

The Uber tokens live in CSS custom properties. There are two ways to use them:

1. **Via `style` attribute** (for tokens NOT in `@theme inline`):
   ```tsx
   <h1 style={{ fontSize: "var(--uber-text-card-title)", lineHeight: "var(--uber-leading-card)" }}>
   ```

2. **Via Tailwind utility classes** (for tokens IN `@theme inline`):
   ```tsx
   <Card className="shadow-uber-light rounded-card" />
   <Badge className="rounded-pill" />
   ```

The following aliases are available as Tailwind classes:
- `shadow-uber-light`, `shadow-uber-medium`, `shadow-uber-floating`
- `rounded-pill`, `rounded-card`, `rounded-featured`

For everything else (typography sizes, spacing, colors), use `style={{ }}` or `className="text-[var(--uber-text-caption)]"` syntax.

#### Color Token Usage

| Purpose | Token | Light Value | Dark Value |
|---|---|---|---|
| Primary text | `--uber-black` | `#000000` | `#ffffff` |
| Primary bg | `--uber-white` | `#ffffff` | `#000000` |
| Hover bg | `--uber-hover-gray` | `#e2e2e2` | `#1a1a1a` |
| Chip bg | `--uber-chip-gray` | `#efefef` | `#1a1a1a` |
| Body text | `--uber-body-gray` | `#4b4b4b` | `#afafaf` |
| Muted text | `--uber-muted-gray` | `#afafaf` | `#4b4b4b` |
| Links | `--uber-link-blue` | `#0000ee` | `#6699ff` |

#### Component Patterns

- **PdfAnnotationPanel** and **VideoPanel** both accept `isEditing` prop to toggle between read-only and editable modes
- Both components use **optimistic updates**: add to local state immediately, then sync to DB, rollback on error
- Both use a shared **evaluator color palette** (`EVALUATOR_COLORS` array) — if you need to display evaluator-specific colors elsewhere, import or replicate this palette
- The `EvaluationViewClient` now accepts optional `annotations?: PdfAnnotation[]` and `videoComments?: VideoComment[]` props. If not provided, defaults to empty arrays. **BATCH B must update the server page to fetch and pass these**

#### BATCH B Critical Path

The **first BATCH B task** must be `app/evaluator/evaluate/[id]/page.tsx` — update the server component to:
1. Fetch `pdf_annotations` for the current proposal: `supabase.from("pdf_annotations").select("*").eq("proposal_id", proposal.id)`
2. Fetch `video_comments` for the current proposal: `supabase.from("video_comments").select("*").eq("proposal_id", proposal.id)`
3. Fetch current evaluator's `full_name` from the profile data
4. Pass as `annotations={annotations}`, `videoComments={videoComments}`, `evaluatorName={fullName}` to `<EvaluationViewClient />`

Without this, the PDF and Video panels will mount with empty data but will still render correctly (they handle empty states).

### Blockers Before BATCH B Begins

| # | Blocker | Severity | Resolution |
|---|---|---|---|
| 1 | **Migration 009 must be run** on Supabase before PDF/Video features work | **CRITICAL** | Run `supabase/migrations/009_annotations_and_video.sql` in Supabase SQL Editor |
| 2 | Old `009_evaluator_annotations.sql` still exists | LOW | Delete it or leave it — it has no content that conflicts. The real migration is `009_annotations_and_video.sql` |
| 3 | `npm run build` not yet verified | MEDIUM | BATCH B or C should run production build as a final verification step |

