import { createClient } from "@/lib/supabase/server";
import { AdminDashboardClient } from "./client";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { data: proposals },
    { data: evaluations },
    { data: evaluators },
    { data: assignments }
  ] = await Promise.all([
    supabase
      .from("proposals")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
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
      `),
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "evaluator"),
    supabase
      .from("proposal_assignments")
      .select("*")
  ]);

  // Group evaluations by proposal_id, storing individual scores per evaluator
  const breakdownData: Record<string, any[]> = {};
  if (evaluations) {
    // proposal_id -> Map<criterion_id, { name, max_score, scores: { [evaluator_id]: score } }>
    const accumulator: Record<string, Map<string, { name: string; max_score: number; scores: Record<string, number> }>> = {};

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
          max_score: (criteria as any).max_score,
          scores: {},
        });
      }
      accumulator[ev.proposal_id].get(key)!.scores[ev.evaluator_id] = ev.score;
    });

    for (const [proposalId, criteriaMap] of Object.entries(accumulator)) {
      breakdownData[proposalId] = Array.from(criteriaMap.values());
    }
  }

  // Build a map: proposalId -> array of evaluator full_names
  const evaluatorByProposal: Record<string, string[]> = {};
  if (evaluations && evaluators) {
    const evaluatorMap = new Map(evaluators.map((e) => [e.id, e.full_name]));
    for (const ev of evaluations) {
      if (!evaluatorByProposal[ev.proposal_id]) {
        evaluatorByProposal[ev.proposal_id] = [];
      }
      const fullName = evaluatorMap.get(ev.evaluator_id);
      if (fullName && !evaluatorByProposal[ev.proposal_id].includes(fullName)) {
        evaluatorByProposal[ev.proposal_id].push(fullName);
      }
    }
  }

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

