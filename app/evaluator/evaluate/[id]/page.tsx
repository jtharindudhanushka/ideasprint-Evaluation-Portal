import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EvaluationViewClient } from "./client";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: proposal } = await supabase.from("proposals").select("team_name").eq("id", id).single();
  return {
    title: proposal ? `Evaluate ${proposal.team_name} | ideasprint 2026` : "Evaluate Proposal | ideasprint 2026",
  };
}

export default async function EvaluationPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [
    { data: proposal },
    { data: assignment },
    { data: sections },
    { data: existingEvaluations },
    { data: annotations },
    { data: videoComments },
    { data: profile }
  ] = await Promise.all([
    supabase.from("proposals").select("*").eq("id", id).single(),
    supabase.from("proposal_assignments").select("*").eq("proposal_id", id).eq("evaluator_id", user.id).single(),
    supabase.from("rubric_sections").select("*, criteria:rubric_criteria(*)").order("order_index", { ascending: true }),
    supabase.from("evaluations").select("*").eq("proposal_id", id).eq("evaluator_id", user.id),
    supabase.from("pdf_annotations").select("*").eq("proposal_id", id),
    supabase.from("video_comments").select("*").eq("proposal_id", id),
    supabase.from("profiles").select("full_name").eq("id", user.id).single()
  ]);

  if (!proposal) redirect("/evaluator");

  // HARD SERVER-SIDE GUARD: Only the assigned evaluator can access this page
  if (!assignment) {
    // Redirect back with a message via search param (displayed as toast on evaluator page)
    redirect("/evaluator?error=not_assigned");
  }

  // Sort criteria within each section
  const sortedSections = (sections ?? []).map((section) => ({
    ...section,
    criteria: (section.criteria ?? []).sort(
      (a: { order_index: number }, b: { order_index: number }) =>
        a.order_index - b.order_index
    ),
  }));

  return (
    <EvaluationViewClient
      proposal={proposal}
      sections={sortedSections}
      existingEvaluations={existingEvaluations ?? []}
      currentUserId={user.id}
      serverNow={new Date().toISOString()}
      annotations={annotations ?? []}
      videoComments={videoComments ?? []}
      evaluatorName={profile?.full_name ?? ""}
    />
  );
}

