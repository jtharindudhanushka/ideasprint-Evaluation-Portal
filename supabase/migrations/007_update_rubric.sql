-- ============================================================
-- ideasprint 2026 Evaluation Dashboard
-- Migration 007: Update Rubric to New Grading Scheme
-- Run this in the Supabase SQL Editor to update the existing rubric data.
-- ============================================================

-- SECTION 1: Proposal (70 marks)
INSERT INTO public.rubric_sections (id, name, total_marks, order_index)
VALUES ('a1000000-0000-0000-0000-000000000001', 'Proposal', 70, 1)
ON CONFLICT (id) DO UPDATE SET total_marks = EXCLUDED.total_marks, name = EXCLUDED.name, order_index = EXCLUDED.order_index;

-- 1.1 Problem Definition (Max 15)
INSERT INTO public.rubric_criteria (id, section_id, name, description, max_score, grading_bands, order_index)
VALUES (
  'c1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001',
  'Problem definition',
  'Problem is sharply defined with clear context, stakeholders, urgency, and a concise solution preview.',
  15,
  '["Excellent · 12–15", "Good · 8–11", "Developing · 4–7", "Weak / Fail · 0–3"]'::jsonb,
  1
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, max_score = EXCLUDED.max_score, grading_bands = EXCLUDED.grading_bands, order_index = EXCLUDED.order_index;

-- 1.2 Analysis (Max 10)
INSERT INTO public.rubric_criteria (id, section_id, name, description, max_score, grading_bands, order_index)
VALUES (
  'c1000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000001',
  'Analysis',
  'Root causes clearly analyzed; key affected groups identified; existing solutions evaluated with specific gaps; competitors and substitutes outlined.',
  10,
  '["Excellent · 9–10", "Good · 7–8", "Developing · 4–6", "Weak / Fail · 0–3"]'::jsonb,
  2
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, max_score = EXCLUDED.max_score, grading_bands = EXCLUDED.grading_bands, order_index = EXCLUDED.order_index;

-- 1.3 Solution (Max 12)
INSERT INTO public.rubric_criteria (id, section_id, name, description, max_score, grading_bands, order_index)
VALUES (
  'c1000000-0000-0000-0000-000000000003',
  'a1000000-0000-0000-0000-000000000001',
  'Solution',
  'Solution is clearly and practically described, directly addressing the problem; core features explained at the right level of detail.',
  12,
  '["Excellent · 10–12", "Good · 7–9", "Developing · 4–6", "Weak / Fail · 0–3"]'::jsonb,
  3
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, max_score = EXCLUDED.max_score, grading_bands = EXCLUDED.grading_bands, order_index = EXCLUDED.order_index;

-- 1.4 Product overview & uniqueness (Max 10)
INSERT INTO public.rubric_criteria (id, section_id, name, description, max_score, grading_bands, order_index)
VALUES (
  'c1000000-0000-0000-0000-000000000004',
  'a1000000-0000-0000-0000-000000000001',
  'Product overview & uniqueness',
  'Compelling overview of what the product is, who it serves, and how it uniquely delivers value; differentiation is specific and well-argued.',
  10,
  '["Excellent · 9–10", "Good · 7–8", "Developing · 4–6", "Weak / Fail · 0–3"]'::jsonb,
  4
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, max_score = EXCLUDED.max_score, grading_bands = EXCLUDED.grading_bands, order_index = EXCLUDED.order_index;

-- 1.5 Business model & marketing plan (Max 10)
INSERT INTO public.rubric_criteria (id, section_id, name, description, max_score, grading_bands, order_index)
VALUES (
  'c1000000-0000-0000-0000-000000000005',
  'a1000000-0000-0000-0000-000000000001',
  'Business model & marketing plan',
  'Target users and customers clearly distinguished; value creation well-articulated; revenue model or sustainability plan is specific and plausible.',
  10,
  '["Excellent · 9–10", "Good · 7–8", "Developing · 4–6", "Weak / Fail · 0–3"]'::jsonb,
  5
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, max_score = EXCLUDED.max_score, grading_bands = EXCLUDED.grading_bands, order_index = EXCLUDED.order_index;

-- 1.6 Technical overview & implementation (Max 7)
INSERT INTO public.rubric_criteria (id, section_id, name, description, max_score, grading_bands, order_index)
VALUES (
  'c1000000-0000-0000-0000-000000000006',
  'a1000000-0000-0000-0000-000000000001',
  'Technical overview & implementation',
  'High-level architecture clearly described; relevant tools, frameworks and integrations named; scalability, security or performance considerations addressed.',
  7,
  '["Excellent · 6–7", "Good · 4–5", "Developing · 2–3", "Weak / Fail · 0–1"]'::jsonb,
  6
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, max_score = EXCLUDED.max_score, grading_bands = EXCLUDED.grading_bands, order_index = EXCLUDED.order_index;

-- 1.7 User scenario (Max 3)
INSERT INTO public.rubric_criteria (id, section_id, name, description, max_score, grading_bands, order_index)
VALUES (
  'c1000000-0000-0000-0000-000000000007',
  'a1000000-0000-0000-0000-000000000001',
  'User scenario',
  'Realistic, well-defined user scenario with clear step-by-step interaction and a concrete outcome.',
  3,
  '["Excellent · 3", "Good · 2", "Weak / Fail · 0–1"]'::jsonb,
  7
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, max_score = EXCLUDED.max_score, grading_bands = EXCLUDED.grading_bands, order_index = EXCLUDED.order_index;

-- 1.8 Conclusion (Max 3)
INSERT INTO public.rubric_criteria (id, section_id, name, description, max_score, grading_bands, order_index)
VALUES (
  'c1000000-0000-0000-0000-000000000008',
  'a1000000-0000-0000-0000-000000000001',
  'Conclusion',
  'Concise summary of problem, solution and impact; reinforces value; future directions mentioned.',
  3,
  '["Excellent · 3", "Good · 2", "Weak / Fail · 0–1"]'::jsonb,
  8
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, max_score = EXCLUDED.max_score, grading_bands = EXCLUDED.grading_bands, order_index = EXCLUDED.order_index;

-- SECTION 2: Pitch Video (30 marks)
INSERT INTO public.rubric_sections (id, name, total_marks, order_index)
VALUES ('a1000000-0000-0000-0000-000000000002', 'Pitch Video', 30, 2)
ON CONFLICT (id) DO UPDATE SET total_marks = EXCLUDED.total_marks, name = EXCLUDED.name, order_index = EXCLUDED.order_index;

-- 2.1 Hook & problem framing (Max 8)
INSERT INTO public.rubric_criteria (id, section_id, name, description, max_score, grading_bands, order_index)
VALUES (
  'c2000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000002',
  'Hook & problem framing',
  'Immediately engaging; viewer understands the problem, who it affects, and why it matters within the first 20 seconds.',
  8,
  '["Excellent · 6–8", "Good · 4–5", "Developing · 2–3", "Weak / Fail · 0–1"]'::jsonb,
  1
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, max_score = EXCLUDED.max_score, grading_bands = EXCLUDED.grading_bands, order_index = EXCLUDED.order_index;

-- 2.2 Solution & business case (Max 12)
INSERT INTO public.rubric_criteria (id, section_id, name, description, max_score, grading_bands, order_index)
VALUES (
  'c2000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000002',
  'Solution & business case',
  'Solution is vivid and jargon-free; target users, value creation, and business model all clearly articulated.',
  12,
  '["Excellent · 10–12", "Good · 7–9", "Developing · 4–6", "Weak / Fail · 0–3"]'::jsonb,
  2
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, max_score = EXCLUDED.max_score, grading_bands = EXCLUDED.grading_bands, order_index = EXCLUDED.order_index;

-- 2.3 Delivery, confidence & pacing (Max 7)
INSERT INTO public.rubric_criteria (id, section_id, name, description, max_score, grading_bands, order_index)
VALUES (
  'c2000000-0000-0000-0000-000000000003',
  'a1000000-0000-0000-0000-000000000002',
  'Delivery, confidence & pacing',
  'Confident, clear delivery; logical structure within time limit; strong, memorable close.',
  7,
  '["Excellent · 6–7", "Good · 4–5", "Developing · 2–3", "Weak / Fail · 0–1"]'::jsonb,
  3
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, max_score = EXCLUDED.max_score, grading_bands = EXCLUDED.grading_bands, order_index = EXCLUDED.order_index;

-- 2.4 Overall video quality (Max 3)
INSERT INTO public.rubric_criteria (id, section_id, name, description, max_score, grading_bands, order_index)
VALUES (
  'c2000000-0000-0000-0000-000000000004',
  'a1000000-0000-0000-0000-000000000002',
  'Overall video quality',
  'Clearly shows strong effort: clear audio, good framing, and thoughtful editing or presentation that enhances the pitch.',
  3,
  '["Excellent · 3", "Weak / Fail · 0–2"]'::jsonb,
  4
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, max_score = EXCLUDED.max_score, grading_bands = EXCLUDED.grading_bands, order_index = EXCLUDED.order_index;
