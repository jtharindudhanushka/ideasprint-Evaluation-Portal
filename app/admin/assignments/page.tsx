import { createClient } from "@/lib/supabase/server";
import { AssignmentsClient } from "./client";

export default async function AssignmentsPage() {
  const supabase = await createClient();

  // Fetch all proposals (with assigned profile name via join)
  const { data: proposals } = await supabase
    .from("proposals")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch all evaluator profiles for the assignment dropdown
  const { data: evaluators } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("role", "evaluator")
    .order("full_name", { ascending: true });

  // Fetch all assignments
  const { data: assignments } = await supabase
    .from("proposal_assignments")
    .select("*");

  return (
    <AssignmentsClient
      proposals={proposals ?? []}
      evaluators={evaluators ?? []}
      assignments={assignments ?? []}
    />
  );
}
