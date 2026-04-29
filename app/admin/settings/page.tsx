import { createClient } from "@/lib/supabase/server";
import { AdminSettingsClient } from "./client";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("system_settings")
    .select("*");

  const initialDeadline = settings?.find((s) => s.key === "evaluation_deadline")?.value ?? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  return <AdminSettingsClient initialDeadline={initialDeadline as string} />;
}
