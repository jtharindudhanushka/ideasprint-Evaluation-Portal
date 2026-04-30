"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { PasswordChangeForm } from "@/components/password-change-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [initializing, setInitializing] = React.useState(true);
  const [hasSession, setHasSession] = React.useState(false);
  const router = useRouter();
  const supabase = createClient();

  React.useEffect(() => {
    const init = async () => {
      // PKCE flow: Supabase sends ?code=xxx in the URL query params
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        // Exchange the code for a session server-side
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          setHasSession(true);
          setInitializing(false);
          return;
        } else {
          console.error("Code exchange failed:", error.message);
        }
      }

      // Implicit / fragment flow: Supabase puts #access_token=xxx in the URL hash.
      // onAuthStateChange fires PASSWORD_RECOVERY when the SDK picks up the hash.
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY" && session) {
          setHasSession(true);
          setInitializing(false);
        }
      });

      // Also check if a session already exists (e.g. hash was processed synchronously)
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setHasSession(true);
        setInitializing(false);
        subscription.unsubscribe();
        return;
      }

      // Give the SDK up to 3s to parse the hash fragment before giving up
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        const { data: polled } = await supabase.auth.getSession();
        if (polled.session) {
          setHasSession(true);
          setInitializing(false);
          clearInterval(poll);
          subscription.unsubscribe();
        } else if (attempts >= 3) {
          clearInterval(poll);
          subscription.unsubscribe();
          setHasSession(false);
          setInitializing(false);
          toast.error("This password reset link is invalid or has expired.");
        }
      }, 1000);
    };

    init();
  }, [supabase]);

  const handleSuccess = () => {
    toast.success("Password reset complete. Please sign in with your new password.");
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        background: "var(--bw-bg-primary)",
      }}
    >
      {/* ── Left panel — hero image + brand (desktop lg+ only) ── */}
      <div
        className="hidden lg:flex"
        style={{
          flex: "0 0 50%",
          background: "var(--bw-bg-inverse)",
          position: "relative",
          overflow: "hidden",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "var(--bw-space-12)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url(/loginimage.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)",
          }}
        />

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
              color: "rgba(255, 255, 255, 0.75)",
              lineHeight: "var(--bw-lh-body)",
              maxWidth: 400,
            }}
          >
            Security Management.
            <br />
            Reset your password to regain access to your dashboard.
          </p>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div
        style={{
          flex: "1 1 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(24px, 6vw, 64px) clamp(20px, 5vw, 48px)",
          minHeight: "100dvh",
        }}
      >
        <div style={{ width: "100%", maxWidth: 400 }}>
          {/* Mobile / tablet brand badge (hidden on desktop) */}
          <div
            className="lg:hidden"
            style={{ marginBottom: "var(--bw-space-10)", textAlign: "center" }}
          >
            <div
              style={{
                width: 44,
                height: 44,
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
                fontSize: "clamp(1.5rem, 5vw, 2rem)",
                fontWeight: "var(--bw-fw-bold)" as any,
                color: "var(--bw-content-primary)",
                lineHeight: "var(--bw-lh-tight)",
              }}
            >
              ideasprint 2026
            </h1>
          </div>

          {initializing ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <Loader2 size={32} className="animate-spin text-bw-content-tertiary" />
              <p style={{ color: "var(--bw-content-secondary)", fontSize: "var(--bw-fs-sm)" }}>
                Validating security token...
              </p>
            </div>
          ) : hasSession ? (
            <>
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
                Set new password
              </h2>
              <p
                style={{
                  fontSize: "var(--bw-fs-sm)",
                  color: "var(--bw-content-secondary)",
                  marginBottom: "var(--bw-space-8)",
                }}
              >
                Please choose a secure password that you haven&apos;t used before.
              </p>

              <PasswordChangeForm
                showSkip={false}
                onSuccess={handleSuccess}
              />
            </>
          ) : (
            <div className="text-center">
              <p style={{ color: "var(--bw-negative)", marginBottom: "var(--bw-space-4)" }}>
                Authentication failed or link expired.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="bw-button"
                style={{
                  padding: "10px 20px",
                  borderRadius: "var(--bw-radius-pill)",
                  background: "var(--bw-bg-inverse)",
                  color: "var(--bw-content-inverse)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Return to Login
              </button>
            </div>
          )}

          <p
            style={{
              marginTop: "var(--bw-space-8)",
              fontSize: "var(--bw-fs-xs)",
              color: "var(--bw-content-disabled)",
              textAlign: "center",
              lineHeight: "var(--bw-lh-relaxed)",
            }}
          >
            Secured by Supabase Authentication.
            <br />
            Always ensure you are on the official ideasprint portal.
          </p>
        </div>
      </div>
    </div>
  );
}
