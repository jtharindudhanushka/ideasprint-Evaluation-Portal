import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { AdminFeedbackClient } from "./client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evaluator Feedback | Admin | ideasprint 2026",
  description: "View evaluator feedback for ideasprint 2026.",
};

export default async function AdminFeedbackPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") redirect("/evaluator");

  // Use admin client to bypass RLS and read all feedback rows
  const adminClient = createAdminClient();

  const [{ data: feedbackRows }, { data: evaluators }] = await Promise.all([
    adminClient
      .from("evaluator_feedback")
      .select("*")
      .order("submitted_at", { ascending: false }),
    adminClient
      .from("profiles")
      .select("id, full_name")
      .eq("role", "evaluator"),
  ]);

  return (
    <AdminFeedbackClient
      feedbackRows={feedbackRows ?? []}
      evaluators={evaluators ?? []}
    />
  );
}
