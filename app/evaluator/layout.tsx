import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evaluator Dashboard | ideasprint 2026",
  description: "Evaluate ideasprint 2026 proposals",
};

export default async function EvaluatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar fullName={profile.full_name} role={profile.role} />
      <main
        style={{
          flex: 1,
          padding: "var(--bw-space-6) var(--bw-space-4)",
          background: "var(--bw-bg-secondary)",
        }}
        className="sm:px-6 md:px-8"
      >
        {children}
      </main>
    </div>
  );
}
