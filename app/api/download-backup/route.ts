import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// GET /api/download-backup
// Admin-only: streams a full JSON backup of all application tables.
export async function GET() {
  try {
    // 1. Verify caller is an authenticated admin
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Fetch all tables using the service-role client (bypasses RLS)
    const admin = createAdminClient();

    const [
      { data: profiles },
      { data: proposals },
      { data: rubric_sections },
      { data: rubric_criteria },
      { data: evaluations },
      { data: proposal_assignments },
      { data: evaluation_overall_notes },
      { data: evaluator_feedback },
      { data: system_settings },
    ] = await Promise.all([
      admin.from("profiles").select("*").order("created_at"),
      admin.from("proposals").select("*").order("created_at"),
      admin.from("rubric_sections").select("*").order("order_index"),
      admin.from("rubric_criteria").select("*").order("order_index"),
      admin.from("evaluations").select("*").order("created_at"),
      admin.from("proposal_assignments").select("*").order("created_at"),
      admin.from("evaluation_overall_notes").select("*"),
      admin.from("evaluator_feedback").select("*").order("submitted_at"),
      admin.from("system_settings").select("*"),
    ]);

    const backup = {
      meta: {
        exported_at: new Date().toISOString(),
        exported_by: user.id,
        project: "ideasprint 2026",
        version: "1.0",
      },
      tables: {
        profiles:                  profiles                ?? [],
        proposals:                 proposals               ?? [],
        rubric_sections:           rubric_sections         ?? [],
        rubric_criteria:           rubric_criteria         ?? [],
        evaluations:               evaluations             ?? [],
        proposal_assignments:      proposal_assignments    ?? [],
        evaluation_overall_notes:  evaluation_overall_notes ?? [],
        evaluator_feedback:        evaluator_feedback      ?? [],
        system_settings:           system_settings         ?? [],
      },
    };

    const json = JSON.stringify(backup, null, 2);
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    return new NextResponse(json, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="ideasprint-backup-${timestamp}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[download-backup] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
