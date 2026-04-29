import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | ideasprint 2026",
  description: "Manage ideasprint 2026 evaluations",
};

export default async function AdminLayout({
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

  if (!profile || profile.role !== "admin") redirect("/evaluator");

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar fullName={profile.full_name} role={profile.role} />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />
        <main
          style={{
            flex: 1,
            padding: "var(--bw-space-6) var(--bw-space-4)",
            background: "var(--bw-bg-secondary)",
            minWidth: 0,
          }}
          className="sm:px-6 md:px-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
