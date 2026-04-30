"use client";
import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, Check, ArrowRight, Eye, EyeOff } from "lucide-react";

interface PasswordChangeFormProps {
  onSuccess?: () => void;
  onSkip?: () => void;
  showSkip?: boolean;
}

export function PasswordChangeForm({
  onSuccess,
  onSkip,
  showSkip = false,
}: PasswordChangeFormProps) {
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [complete, setComplete] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in both fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    setComplete(true);
    setLoading(false);
    toast.success("Password updated successfully.");

    if (onSuccess) {
      // Delay slightly to show success state
      setTimeout(onSuccess, 1500);
    }
  };

  if (complete) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "var(--bw-space-8) 0",
          gap: "var(--bw-space-4)",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "var(--bw-radius-circle)",
            background: "var(--bw-bg-inverse)",
            color: "var(--bw-content-inverse)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Check size={28} strokeWidth={2.5} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--bw-space-2)" }}>
          <h3
            style={{
              fontFamily: "var(--bw-font-heading)",
              fontSize: "var(--bw-fs-h4)",
              fontWeight: "var(--bw-fw-bold)" as any,
              color: "var(--bw-content-primary)",
              margin: 0,
            }}
          >
            Password updated
          </h3>
          <p
            style={{
              fontSize: "var(--bw-fs-sm)",
              color: "var(--bw-content-secondary)",
              lineHeight: "var(--bw-lh-body)",
              maxWidth: 300,
              margin: "0 auto",
            }}
          >
            Your password has been set. Sign in with your new password next time you log in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--bw-space-4)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--bw-space-4)" }}>
          {/* New Password */}
          <div>
            <label
              htmlFor="new-password"
              style={{
                display: "block",
                fontSize: "var(--bw-fs-sm)",
                fontWeight: "var(--bw-fw-medium)" as any,
                color: "var(--bw-content-primary)",
                marginBottom: "var(--bw-space-2)",
              }}
            >
              New Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bw-input"
                style={{
                  height: 48,
                  fontSize: "16px",
                  borderRadius: "var(--bw-radius-md)",
                  paddingRight: 48,
                }}
                required
              />
              <button
                type="button"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
                onClick={() => setShowNewPassword((v) => !v)}
                tabIndex={-1}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  color: "var(--bw-content-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirm-password"
              style={{
                display: "block",
                fontSize: "var(--bw-fs-sm)",
                fontWeight: "var(--bw-fw-medium)" as any,
                color: "var(--bw-content-primary)",
                marginBottom: "var(--bw-space-2)",
              }}
            >
              Confirm Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bw-input"
                style={{
                  height: 48,
                  fontSize: "16px",
                  borderRadius: "var(--bw-radius-md)",
                  paddingRight: 48,
                }}
                required
              />
              <button
                type="button"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                onClick={() => setShowConfirmPassword((v) => !v)}
                tabIndex={-1}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  color: "var(--bw-content-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--bw-space-3)", paddingTop: "var(--bw-space-2)" }}>
          <button
            type="submit"
            disabled={loading}
            className="bw-button"
            style={{
              width: "100%",
              height: 52, // Match LoginPage height
              borderRadius: "var(--bw-radius-pill)",
              background: "var(--bw-bg-inverse)",
              color: "var(--bw-content-inverse)",
              fontSize: "var(--bw-fs-base)", // Match LoginPage
              fontWeight: "var(--bw-fw-medium)" as any,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--bw-space-2)",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all var(--bw-duration-normal) var(--bw-easing)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Update Password
                <ArrowRight size={18} />
              </>
            )}
          </button>

          {showSkip && onSkip && (
            <button
              type="button"
              onClick={onSkip}
              disabled={loading}
              className="bw-button"
              style={{
                width: "100%",
                height: 52, // Match submit button
                borderRadius: "var(--bw-radius-pill)",
                background: "var(--bw-bg-primary)",
                color: "var(--bw-content-primary)",
                border: "1px solid var(--bw-border-strong)",
                fontSize: "var(--bw-fs-base)", // Match submit button
                fontWeight: "var(--bw-fw-medium)" as any,
                cursor: "pointer",
                transition: "all var(--bw-duration-normal) var(--bw-easing)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bw-hover-light)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bw-bg-primary)")}
            >
              Skip for now
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
