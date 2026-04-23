import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EvaluationViewClient } from "./client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EvaluationPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch proposal
  const { data: proposal } = await supabase
    .from("proposals")
    .select("*")
    .eq("id", id)
    .single();

  if (!proposal) redirect("/evaluator");

  // HARD SERVER-SIDE GUARD: Only the assigned evaluator can access this page
  if (proposal.assigned_to !== user.id) {
    // Redirect back with a message via search param (displayed as toast on evaluator page)
    redirect("/evaluator?error=not_assigned");
  }

  // Fetch rubric sections with criteria
  const { data: sections } = await supabase
    .from("rubric_sections")
    .select("*, criteria:rubric_criteria(*)")
    .order("order_index", { ascending: true });

  // Sort criteria within each section
  const sortedSections = (sections ?? []).map((section) => ({
    ...section,
    criteria: (section.criteria ?? []).sort(
      (a: { order_index: number }, b: { order_index: number }) =>
        a.order_index - b.order_index
    ),
  }));

  // Fetch existing evaluations for this proposal by this user
  const { data: existingEvaluations } = await supabase
    .from("evaluations")
    .select("*")
    .eq("proposal_id", id)
    .eq("evaluator_id", user.id);

  return (
    <EvaluationViewClient
      proposal={proposal}
      sections={sortedSections}
      existingEvaluations={existingEvaluations ?? []}
      currentUserId={user.id}
      serverNow={new Date().toISOString()}
    />
  );
}

