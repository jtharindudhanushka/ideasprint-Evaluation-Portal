-- ============================================================
-- ideasprint 2026 Evaluation Dashboard
-- Migration 003: Seed Rubric Data
-- Run this AFTER 001 & 002 in the Supabase SQL Editor.
-- ============================================================

-- ============================================================
-- SECTION 1: Proposal (70 marks)
-- ============================================================
INSERT INTO public.rubric_sections (id, name, total_marks, order_index)
VALUES ('a1000000-0000-0000-0000-000000000001', 'Proposal', 70, 1);

-- 1.1 Problem Definition (Max 10)
INSERT INTO public.rubric_criteria (id, section_id, name, description, max_score, grading_bands, order_index)
VALUES (
  'c1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001',
  'Problem Definition',
  'Is the problem clearly and specifically defined? Is it evident who is affected and why it matters right now? Is a brief solution overview included?',
  10,
  '["Excellent · 9–10", "Good · 7–8", "Developing · 4–6", "Weak · 0–3"]'::jsonb,
  1
);

-- 1.2 Analysis (Max 10)
INSERT INTO public.rubric_criteria (id, section_id, name, description, max_score, grading_bands, order_index)
VALUES (
  'c1000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000001',
  'Analysis',
  'Are root causes explored and who is most affected made clear? Are existing solutions analyzed with specific limitations? Are competitors and substitutes identified?',
  10,
  '["Excellent · 9–10", "Good · 7–8", "Developing · 4–6", "Weak · 0–3"]'::jsonb,
  2
);

-- 1.3 Solution (Max 10)
INSERT INTO public.rubric_criteria (id, section_id, name, description, max_score, grading_bands, order_index)
VALUES (
  'c1000000-0000-0000-0000-000000000003',
  'a1000000-0000-0000-0000-000000000001',
  'Solution',
  'Is the proposed solution described in a clear, practical manner? Does it directly address the identified problem? Are core functionality and key features explained without going too deep into technical implementation?',
  10,
  '["Excellent · 9–10", "Good · 7–8", "Developing · 4–6", "Weak · 0–3"]'::jsonb,
  3
);

-- 1.4 Product Overview & Uniqueness (Max 10)
INSERT INTO public.rubric_criteria (id, section_id, name, description, max_score, grading_bands, order_index)
VALUES (
  'c1000000-0000-0000-0000-000000000004',
  'a1000000-0000-0000-0000-000000000001',
  'Product Overview & Uniqueness',
  'Is there a clear product overview — what it is, who it is for, and its core functions? Are value-delivering features summarized? Is differentiation from existing solutions clearly explained?',
  10,
  '["Excellent · 9–10", "Good · 7–8", "Developing · 4–6", "Weak · 0–3"]'::jsonb,
  4
);

-- 1.5 Business Model & Marketing Plan (Max 10)
INSERT INTO public.rubric_criteria (id, section_id, name, description, max_score, grading_bands, order_index)
VALUES (
  'c1000000-0000-0000-0000-000000000005',
  'a1000000-0000-0000-0000-000000000001',
  'Business Model & Marketing Plan',
  'Are target users and customers clearly identified? Is value creation explained? Is there a revenue model, monetization approach, or sustainability plan described?',
  10,
  '["Excellent · 9–10", "Good · 7–8", "Developing · 4–6", "Weak · 0–3"]'::jsonb,
  5
);

-- 1.6 Technical Overview & Implementation (Max 10)
INSERT INTO public.rubric_criteria (id, section_id, name, description, max_score, grading_bands, order_index)
VALUES (
  'c1000000-0000-0000-0000-000000000006',
  'a1000000-0000-0000-0000-000000000001',
  'Technical Overview & Implementation',
  'Is the system architecture described at a high level — components, technologies, integrations? Are the tools, frameworks, and platforms mentioned? Is there consideration of scalability, security, or performance?',
  10,
  '["Excellent · 9–10", "Good · 7–8", "Developing · 4–6", "Weak · 0–3"]'::jsonb,
  6
);

-- 1.7 User Scenario (Max 6)
INSERT INTO public.rubric_criteria (id, section_id, name, description, max_score, grading_bands, order_index)
VALUES (
  'c1000000-0000-0000-0000-000000000007',
  'a1000000-0000-0000-0000-000000000001',
  'User Scenario',
  'Is there a realistic, step-by-step use case? Is the user clearly defined? Does it walk through how they interact with the system and what outcome they achieve?',
  6,
  '["Excellent · 5–6", "Good · 3–4", "Weak · 0–2"]'::jsonb,
  7
);

-- 1.8 Conclusion (Max 4)
INSERT INTO public.rubric_criteria (id, section_id, name, description, max_score, grading_bands, order_index)
VALUES (
  'c1000000-0000-0000-0000-000000000008',
  'a1000000-0000-0000-0000-000000000001',
  'Conclusion',
  'Does it clearly summarize the problem, solution, and expected impact? Does it reinforce why this is worth building? Are future improvements or expansion possibilities mentioned?',
  4,
  '["Strong · 4", "Adequate · 2–3", "Weak · 0–1"]'::jsonb,
  8
);

-- ============================================================
-- SECTION 2: Pitch Video (30 marks)
-- ============================================================
INSERT INTO public.rubric_sections (id, name, total_marks, order_index)
VALUES ('a1000000-0000-0000-0000-000000000002', 'Pitch Video', 30, 2);

-- 2.1 Hook & Problem Framing (Max 8)
INSERT INTO public.rubric_criteria (id, section_id, name, description, max_score, grading_bands, order_index)
VALUES (
  'c2000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000002',
  'Hook & Problem Framing',
  'Is the opening engaging, specific, and relatable? Does the viewer understand who is affected and why this matters within the first 20 seconds? Does the team make you care about the problem?',
  8,
  '["Excellent · 7–8", "Good · 5–6", "Developing · 3–4", "Weak · 0–2"]'::jsonb,
  1
);

-- 2.2 Solution & Business Case (Max 14)
INSERT INTO public.rubric_criteria (id, section_id, name, description, max_score, grading_bands, order_index)
VALUES (
  'c2000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000002',
  'Solution & Business Case',
  'Is the idea explained clearly enough that a viewer can visualize how it works? Is jargon avoided? Are target users identified and value creation articulated? Is there any mention of revenue, monetization, or sustainability?',
  14,
  '["Excellent · 12–14", "Good · 9–11", "Developing · 5–8", "Weak · 0–4"]'::jsonb,
  2
);

-- 2.3 Delivery, Confidence & Pacing (Max 8)
INSERT INTO public.rubric_criteria (id, section_id, name, description, max_score, grading_bands, order_index)
VALUES (
  'c2000000-0000-0000-0000-000000000003',
  'a1000000-0000-0000-0000-000000000002',
  'Delivery, Confidence & Pacing',
  'Is the structure logical within the 1–2 minute limit? Does the presenter speak clearly and with confidence? Is the close strong and memorable?',
  8,
  '["Excellent · 7–8", "Good · 5–6", "Developing · 3–4", "Weak · 0–2"]'::jsonb,
  3
);
