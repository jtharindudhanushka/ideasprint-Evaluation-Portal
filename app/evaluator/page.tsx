import { createClient } from "@/lib/supabase/server";
import { EvaluatorDashboardClient } from "./client";
import { redirect } from "next/navigation";

export default async function EvaluatorDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [
    { data: proposals },
    { data: allEvaluations },
    { data: profiles },
    { data: assignments },
    { data: settings }
  ] = await Promise.all([
    supabase
      .from("proposals")
      .select("*")
      .order("created_at", { ascending: false }),
    // Fetch ALL evaluations so we can display per-evaluator scores
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
      .select("id, full_name"),
    supabase
      .from("proposal_assignments")
      .select("*"),
    supabase
      .from("system_settings")
      .select("*")
      .eq("key", "evaluation_deadline")
      .single()
  ]);

  let daysLeft = "14";
  if (settings?.value) {
    const deadlineDate = new Date(settings.value as string);
    const diff = deadlineDate.getTime() - Date.now();
    daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))).toString();
  }

  // My evaluations only
  const myEvaluations = allEvaluations?.filter((e) => e.evaluator_id === user!.id) ?? [];

  // Get unique proposal IDs that this evaluator has graded
  const gradedProposalIds = [
    ...new Set(myEvaluations.map((e) => e.proposal_id)),
  ];

  // Build breakdown for this evaluator's own scores only (for full rubric display)
  const breakdownData: Record<string, any[]> = {};
  const accumulator: Record<string, Map<string, { name: string; score: number; max_score: number }>> = {};
  myEvaluations.forEach((ev) => {
    const criteria = Array.isArray(ev.rubric_criteria) ? ev.rubric_criteria[0] : ev.rubric_criteria;
    if (!criteria) return;

    if (!accumulator[ev.proposal_id]) {
      accumulator[ev.proposal_id] = new Map();
    }
    accumulator[ev.proposal_id].set(ev.rubric_criterion_id, {
      name: (criteria as any).name,
      score: ev.score,
      max_score: (criteria as any).max_score,
    });
  });
  for (const [proposalId, criteriaMap] of Object.entries(accumulator)) {
    breakdownData[proposalId] = Array.from(criteriaMap.values());
  }

  // Build per-evaluator score totals per proposal: proposalId -> { evaluatorId -> { name, total } }
  const scoresByProposal: Record<string, Record<string, { name: string; total: number }>> = {};
  if (allEvaluations && profiles) {
    const evaluatorMap = new Map(profiles.map((p) => [p.id, p.full_name]));
    const perEvalTotals: Record<string, Record<string, number>> = {};
    for (const ev of allEvaluations) {
      if (!perEvalTotals[ev.proposal_id]) perEvalTotals[ev.proposal_id] = {};
      perEvalTotals[ev.proposal_id][ev.evaluator_id] = (perEvalTotals[ev.proposal_id][ev.evaluator_id] ?? 0) + ev.score;
    }
    for (const [proposalId, evalTotals] of Object.entries(perEvalTotals)) {
      scoresByProposal[proposalId] = {};
      for (const [evalId, total] of Object.entries(evalTotals)) {
        const name = evaluatorMap.get(evalId) ?? "Unknown";
        scoresByProposal[proposalId][evalId] = { name, total };
      }
    }
  }

  // Build a map: proposalId -> array of evaluator full_names (for "Evaluated by" pills)
  const evaluatorByProposal: Record<string, string[]> = {};
  if (allEvaluations && profiles) {
    const evaluatorMap = new Map(profiles.map((p) => [p.id, p.full_name]));
    for (const ev of allEvaluations) {
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
    <EvaluatorDashboardClient
      proposals={proposals ?? []}
      currentUserId={user!.id}
      gradedProposalIds={gradedProposalIds}
      profiles={profiles ?? []}
      breakdownData={breakdownData}
      evaluatorByProposal={evaluatorByProposal}
      scoresByProposal={scoresByProposal}
      assignments={assignments ?? []}
      serverNow={new Date().toISOString()}
      daysLeft={daysLeft}
    />
  );
}
