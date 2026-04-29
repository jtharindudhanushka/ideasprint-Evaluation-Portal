"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const supabase = createClient();
  const emailRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in both fields.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Welcome back!");
    router.push("/");
    router.refresh();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "var(--bw-bg-primary)",
      }}
    >
      {/* Left panel — image + brand (desktop only) */}
      <div
        className="hidden lg:flex"
        style={{
          flex: "1 1 50%",
          background: "var(--bw-bg-inverse)",
          position: "relative",
          overflow: "hidden",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "var(--bw-space-12)",
        }}
      >
        {/* Background image */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url(/loginimage.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Brand content over image */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              width: 48,
              height: 48,
              background: "var(--bw-white)",
              borderRadius: "var(--bw-radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--bw-black)",
              fontFamily: "var(--bw-font-heading)",
              fontWeight: "var(--bw-fw-bold)" as any,
              fontSize: "var(--bw-fs-h3)",
              marginBottom: "var(--bw-space-6)",
            }}
          >
            iS
          </div>
          <h1
            style={{
              fontFamily: "var(--bw-font-heading)",
              fontSize: "var(--bw-fs-display)",
              fontWeight: "var(--bw-fw-bold)" as any,
              lineHeight: "var(--bw-lh-tight)",
              color: "var(--bw-white)",
              marginBottom: "var(--bw-space-4)",
            }}
          >
            ideasprint
            <br />
            2026
          </h1>
          <p
            style={{
              fontSize: "var(--bw-fs-lg)",
              color: "rgba(255, 255, 255, 0.7)",
              lineHeight: "var(--bw-lh-body)",
              maxWidth: 400,
            }}
          >
            Evaluation portal for the lecture panel.
            <br />
            Grade proposals, review pitches, shape innovation.
          </p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div
        style={{
          flex: "1 1 50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--bw-space-8)",
          minHeight: "100vh",
        }}
      >
        <div style={{ width: "100%", maxWidth: 400 }}>
          {/* Mobile brand (shown only < lg) */}
          <div className="lg:hidden" style={{ marginBottom: "var(--bw-space-10)", textAlign: "center" }}>
            <div
              style={{
                width: 40,
                height: 40,
                background: "var(--bw-bg-inverse)",
                borderRadius: "var(--bw-radius-md)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--bw-content-inverse)",
                fontFamily: "var(--bw-font-heading)",
                fontWeight: "var(--bw-fw-bold)" as any,
                fontSize: "var(--bw-fs-h4)",
                marginBottom: "var(--bw-space-3)",
              }}
            >
              iS
            </div>
            <h1
              style={{
                fontFamily: "var(--bw-font-heading)",
                fontSize: "var(--bw-fs-h2)",
                fontWeight: "var(--bw-fw-bold)" as any,
                color: "var(--bw-content-primary)",
              }}
            >
              ideasprint 2026
            </h1>
          </div>

          {/* Form heading */}
          <h2
            style={{
              fontFamily: "var(--bw-font-heading)",
              fontSize: "var(--bw-fs-h3)",
              fontWeight: "var(--bw-fw-bold)" as any,
              lineHeight: "var(--bw-lh-heading)",
              color: "var(--bw-content-primary)",
              marginBottom: "var(--bw-space-2)",
            }}
          >
            Sign in
          </h2>
          <p
            style={{
              fontSize: "var(--bw-fs-sm)",
              color: "var(--bw-content-secondary)",
              marginBottom: "var(--bw-space-8)",
            }}
          >
            Enter your credentials to access the evaluation dashboard.
          </p>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "var(--bw-space-5)" }}>
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                style={{
                  display: "block",
                  fontSize: "var(--bw-fs-sm)",
                  fontWeight: "var(--bw-fw-medium)" as any,
                  color: "var(--bw-content-primary)",
                  marginBottom: "var(--bw-space-2)",
                }}
              >
                Email
              </label>
              <input
                ref={emailRef}
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bw-input"
                style={{ height: 48 }}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                style={{
                  display: "block",
                  fontSize: "var(--bw-fs-sm)",
                  fontWeight: "var(--bw-fw-medium)" as any,
                  color: "var(--bw-content-primary)",
                  marginBottom: "var(--bw-space-2)",
                }}
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bw-input"
                style={{ height: 48 }}
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="bw-button bw-button--primary"
              style={{
                width: "100%",
                height: 48,
                borderRadius: "var(--bw-radius-pill)",
                fontFamily: "var(--bw-font-body)",
                fontSize: "var(--bw-fs-base)",
                fontWeight: "var(--bw-fw-medium)" as any,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "var(--bw-space-2)",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                background: "var(--bw-bg-inverse)",
                color: "var(--bw-content-inverse)",
                border: "none",
                transition: "all var(--bw-duration-normal) var(--bw-easing)",
                marginTop: "var(--bw-space-2)",
              }}
            >
              {loading ? (
                <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <>
                  Sign in
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <p
            style={{
              marginTop: "var(--bw-space-8)",
              fontSize: "var(--bw-fs-xs)",
              color: "var(--bw-content-disabled)",
              textAlign: "center",
              lineHeight: "var(--bw-lh-relaxed)",
            }}
          >
            Credentials are provided by the event organizer.
            <br />
            Contact your administrator if you need access.
          </p>
        </div>
      </div>
    </div>
  );
}
