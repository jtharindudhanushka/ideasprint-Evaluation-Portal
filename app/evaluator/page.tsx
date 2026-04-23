import { createClient } from "@/lib/supabase/server";
import { EvaluatorDashboardClient } from "./client";
import { redirect } from "next/navigation";

export default async function EvaluatorDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: proposals } = await supabase
    .from("proposals")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch only this evaluator's own evaluations for the breakdown popup
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

  // Get unique proposal IDs that this evaluator has graded
  const gradedProposalIds = [
    ...new Set(
      evaluations
        ?.filter((e) => e.evaluator_id === user!.id)
        .map((e) => e.proposal_id) ?? []
    ),
  ];

  // Build breakdown for this evaluator's own scores only, deduped by criterion
  const breakdownData: Record<string, any[]> = {};
  if (evaluations) {
    // Only include the current evaluator's evaluations
    const mine = evaluations.filter((e) => e.evaluator_id === user!.id);

    // Deduplicate by rubric_criterion_id per proposal (take the latest score)
    const accumulator: Record<string, Map<string, { name: string; score: number; max_score: number }>> = {};
    mine.forEach((ev) => {
      const criteria = Array.isArray(ev.rubric_criteria) ? ev.rubric_criteria[0] : ev.rubric_criteria;
      if (!criteria) return;

      if (!accumulator[ev.proposal_id]) {
        accumulator[ev.proposal_id] = new Map();
      }
      // Overwrite so last write wins — handles any accidental duplicates
      accumulator[ev.proposal_id].set(ev.rubric_criterion_id, {
        name: (criteria as any).name,
        score: ev.score,
        max_score: (criteria as any).max_score,
      });
    });

    for (const [proposalId, criteriaMap] of Object.entries(accumulator)) {
      breakdownData[proposalId] = Array.from(criteriaMap.values());
    }
  }

  // Fetch profiles for lock info
  const { data: profiles } = await supabase.from("profiles").select("id, full_name");

  return (
    <EvaluatorDashboardClient
      proposals={proposals ?? []}
      currentUserId={user!.id}
      gradedProposalIds={gradedProposalIds}
      profiles={profiles ?? []}
      breakdownData={breakdownData}
      serverNow={new Date().toISOString()}
    />
  );
}

