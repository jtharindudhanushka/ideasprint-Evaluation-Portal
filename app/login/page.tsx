"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Signed in successfully!");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* Left side branding / image — hidden on mobile, shown on lg+ */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col p-10 text-white overflow-hidden">
        <Image
          src="/loginimage.jpg"
          alt="ideasprint 2026 background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-20 flex items-center gap-2">
          <Image src="/favicon.svg" alt="ideasprint logo" width={28} height={28} />
          <span className="text-lg font-semibold tracking-tight">ideasprint 2026</span>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg font-medium">The Intra-Departmental Start-Up Challenge.</p>
            <footer className="text-sm text-white/70">ideasprint 2026</footer>
          </blockquote>
        </div>
      </div>

      {/* Mobile top branding strip — only shown on small screens */}
      <div className="lg:hidden flex items-center gap-2 px-6 pt-8 pb-4">
        <Image src="/favicon.svg" alt="ideasprint logo" width={24} height={24} />
        <span className="text-base font-semibold tracking-tight">ideasprint 2026</span>
      </div>

      {/* Right side form */}
      <div className="flex flex-1 items-center justify-center px-6 py-8 lg:py-0 lg:w-1/2">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and password to sign in
            </p>
          </div>

          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button disabled={loading} type="submit" className="w-full mt-2">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Access is restricted to authorized panel members.
          </p>
        </div>
      </div>
    </div>
  );
}
