import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";

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
    <div className="flex min-h-screen flex-col">
      <Navbar fullName={profile.full_name} role={profile.role} />
      <main className="flex-1 space-y-4 p-4 sm:p-6 md:p-8 pt-4 sm:pt-6">
        {children}
      </main>
    </div>
  );
}
