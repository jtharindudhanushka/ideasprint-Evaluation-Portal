import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// POST /api/nightly-backup — dumps all critical tables into nightly-backups bucket.
// Should be triggered by Supabase pg_cron via a HTTP call to this route.
// Protected: requires a secret header that only the cron job knows.
export async function POST(req: NextRequest) {
  // Simple shared-secret auth for cron calls
  const secret = req.headers.get("x-backup-secret");
  const expected = process.env.BACKUP_SECRET;

  if (!expected || secret !== expected) {
    // Also allow an authenticated admin to trigger manually
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

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const admin = createAdminClient();

  // Fetch all critical tables
  const [{ data: proposals }, { data: evaluations }, { data: profiles }, { data: assignments }] =
    await Promise.all([
      admin.from("proposals").select("*"),
      admin.from("evaluations").select("*"),
      admin.from("profiles").select("id, full_name, role, created_at"),
      admin.from("proposal_assignments").select("*"),
    ]);

  const backup = {
    created_at: new Date().toISOString(),
    tables: {
      proposals: proposals ?? [],
      evaluations: evaluations ?? [],
      profiles: profiles ?? [],
      proposal_assignments: assignments ?? [],
    },
  };

  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const filename = `${date}/full_backup.json`;

  const { error } = await admin.storage
    .from("nightly-backups")
    .upload(filename, JSON.stringify(backup), {
      contentType: "application/json",
      upsert: true,
    });

  if (error) {
    console.error("[nightly-backup] Upload failed:", error.message);
    return NextResponse.json({ ok: false, detail: error.message }, { status: 500 });
  }

  // Clean up backups older than 7 days
  try {
    const { data: files } = await admin.storage.from("nightly-backups").list("", { limit: 100 });
    if (files) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const toDelete = files
        .filter((f) => f.name && f.created_at && new Date(f.created_at) < sevenDaysAgo)
        .map((f) => f.name);

      if (toDelete.length > 0) {
        await admin.storage.from("nightly-backups").remove(toDelete);
      }
    }
  } catch (cleanupErr) {
    console.warn("[nightly-backup] Cleanup failed (non-fatal):", cleanupErr);
  }

  return NextResponse.json({ ok: true, filename });
}
