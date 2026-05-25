import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FeedbackPageClient } from "./client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feedback | ideasprint 2026",
  description: "Share your thoughts on the ideasprint 2026 evaluation portal.",
};

export default async function FeedbackPage() {
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

  if (!profile) redirect("/login");
  if (profile.role === "admin") redirect("/admin/feedback");

  const { data: feedbackRow } = await supabase
    .from("evaluator_feedback")
    .select("*")
    .eq("evaluator_id", user.id)
    .maybeSingle();

  return (
    <FeedbackPageClient
      currentUserId={user.id}
      existingFeedback={feedbackRow ?? null}
    />
  );
}
