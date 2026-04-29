import { createClient } from "@/lib/supabase/server";
import { EvaluatorsClient } from "./client";

export default async function EvaluatorsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return <EvaluatorsClient profiles={profiles ?? []} currentUserId={user?.id} />;
}
