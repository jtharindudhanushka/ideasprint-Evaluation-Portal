import { createClient } from "@/lib/supabase/server";
import { AdminDashboardClient } from "./client";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { data: proposals } = await supabase
    .from("proposals")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch all evaluations with criteria names — include evaluator_id and rubric_criterion_id
  const { data: evaluations } = await supabase
    .from("evaluations")
    .select(`
      proposal_id,
      evaluator_id,
      rubric_criterion_id,
      score,
      rubric_criteria (
        name,
        max_score
      )
    `);

  // Group evaluations by proposal_id, deduplicating per criterion by averaging scores
  // (handles multiple evaluators grading the same proposal or accidental duplicates)
  const breakdownData: Record<string, any[]> = {};
  if (evaluations) {
    // Use a nested Map: proposal_id -> criterion_id -> { name, scores[], max_score }
    const accumulator: Record<string, Map<string, { name: string; scores: number[]; max_score: number }>> = {};

    evaluations.forEach((ev) => {
      const criteria = Array.isArray(ev.rubric_criteria) ? ev.rubric_criteria[0] : ev.rubric_criteria;
      if (!criteria) return;

      if (!accumulator[ev.proposal_id]) {
        accumulator[ev.proposal_id] = new Map();
      }

      const key = ev.rubric_criterion_id;
      if (!accumulator[ev.proposal_id].has(key)) {
        accumulator[ev.proposal_id].set(key, {
          name: (criteria as any).name,
          scores: [],
          max_score: (criteria as any).max_score,
        });
      }
      accumulator[ev.proposal_id].get(key)!.scores.push(ev.score);
    });

    // Collapse to averaged scores
    for (const [proposalId, criteriaMap] of Object.entries(accumulator)) {
      breakdownData[proposalId] = Array.from(criteriaMap.values()).map((c) => ({
        name: c.name,
        score: Math.round(c.scores.reduce((a, b) => a + b, 0) / c.scores.length),
        max_score: c.max_score,
      }));
    }
  }

  // Fetch all profiles (for assigned column and "evaluated by" pill)
  const { data: evaluators } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "evaluator");

  // Build a map: proposalId -> array of evaluator full_names
  const evaluatorByProposal: Record<string, string[]> = {};
  if (evaluations && evaluators) {
    for (const ev of evaluations) {
      if (!evaluatorByProposal[ev.proposal_id]) {
        evaluatorByProposal[ev.proposal_id] = [];
      }
      const profile = evaluators.find((p) => p.id === ev.evaluator_id);
      if (profile && !evaluatorByProposal[ev.proposal_id].includes(profile.full_name)) {
        evaluatorByProposal[ev.proposal_id].push(profile.full_name);
      }
    }
  }

  // Fetch all assignments
  const { data: assignments } = await supabase
    .from("proposal_assignments")
    .select("*");

  return (
    <AdminDashboardClient
      proposals={proposals ?? []}
      breakdownData={breakdownData}
      evaluators={evaluators ?? []}
      evaluatorByProposal={evaluatorByProposal}
      assignments={assignments ?? []}
    />
  );
}

