import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";

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
    <div className="flex min-h-screen flex-col">
      <Navbar fullName={profile.full_name} role={profile.role} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 space-y-4 p-8 pt-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
