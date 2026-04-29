"use client";

import { useState } from "react";
import { Check, ChevronRight, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
  isPreview?: boolean;
}

interface Slide {
  eyebrow: string;
  heading: string;
  body: React.ReactNode;
}

// ─── Slide definitions ────────────────────────────────────────────────────────

const SLIDES: Slide[] = [
  {
    eyebrow: "IDEASPRINT 2026",
    heading: "Welcome.",
    body: (
      <div className="space-y-4">
        <p>
          This is a quick walkthrough of the evaluation platform. It covers your dashboard, your assignments, how to submit evaluations, and how final rankings are calculated. Takes under two minutes.
        </p>
      </div>
    ),
  },
  {
    eyebrow: "DASHBOARD",
    heading: "Your evaluation overview.",
    body: (
      <div className="space-y-4">
        <p>
          The dashboard shows your total assigned proposals, how many are still
          ungraded, and the days remaining until the deadline.
        </p>
        <p>
          The Top 15 panel on the right reflects the live leaderboard based on
          combined averages across all evaluators — it updates automatically as
          evaluations are submitted.
        </p>
      </div>
    ),
  },
  {
    eyebrow: "MY ASSIGNMENTS",
    heading: "Proposals assigned to you.",
    body: (
      <div className="space-y-4">
        <p>
          This table lists every proposal you have been asked to evaluate. Each
          row shows the team, direct links to the proposal document and
          submission, and the current status.
        </p>
        <p>
          When a proposal is ready, the Evaluate button becomes your entry
          point. Use the Show Pending toggle to filter down to ungraded
          submissions only.
        </p>
      </div>
    ),
  },
  {
    eyebrow: "ALL PROPOSALS",
    heading: "Full visibility across all submissions.",
    body: (
      <div className="space-y-4">
        <p>
          All Proposals gives you a read-only view of every team in the
          competition. You can see assigned evaluators and grading status across
          the full pool.
        </p>
        <p>
          The Evaluate action only appears for proposals directly assigned to
          you. Use the Graded only toggle or the All Evaluators filter to narrow
          the view.
        </p>
      </div>
    ),
  },
  {
    eyebrow: "SUBMITTING AN EVALUATION",
    heading: "Rubric-based scoring system.",
    body: (
        <div className="space-y-4">
        <p>
          Opening a proposal loads the PDF viewer alongside the scoring panel.
          Evaluations are split into two sections — Proposal (70 marks) and
          Pitch Video (30 marks).
        </p>
        <div className="flex flex-wrap gap-2" style={{ margin: "var(--bw-space-6) 0" }}>
          {["Excellent", "Good", "Developing", "Weak"].map((label) => (
            <span
              key={label}
              className="rounded-full"
              style={{
                padding: "8px 16px",
                border: "1px solid var(--bw-border)",
                fontSize: "var(--bw-fs-xs)",
                fontWeight: "var(--bw-fw-bold)",
                background: "var(--bw-bg-secondary)",
                color: "var(--bw-content-secondary)",
              }}
            >
              {label}
            </span>
          ))}
        </div>
        <p>
          Enter the mark directly into the field for each criterion. The grade
          band labels show you what range corresponds to each performance level.
        </p>
      </div>
    ),
  },
  {
    eyebrow: "FINAL RANKINGS",
    heading: "Determined by combined averages.",
    body: (
      <div className="space-y-4 flex flex-col h-full">
        <p>
          Each proposal is reviewed by two evaluators. The final score is the
          average of both evaluators' total marks. Individual scores are not
          visible across the panel — only the combined average appears in the
          leaderboard.
        </p>
        <div
          className="flex gap-4 rounded-xl"
          style={{
            margin: "var(--bw-space-6) 0",
            padding: "var(--bw-space-5)",
            background: "var(--bw-warning-bg)",
            border: "1px solid var(--bw-warning)",
            color: "var(--bw-warning)",
          }}
        >
          <span className="text-xl leading-none shrink-0 mt-0.5">⚠️</span>
          <p className="text-[14px] leading-snug font-medium">
            Rankings shift as remaining evaluations come in. Final standings are
            confirmed only once all evaluations are closed.
          </p>
        </div>
        <p
          style={{
            fontSize: "var(--bw-fs-sm)",
            lineHeight: "var(--bw-lh-relaxed)",
            color: "var(--bw-content-secondary)",
          }}
        >
          If a result warrants discussion — an outlier, a borderline team, or a scoring misalignment — coordinate directly with your co-evaluator to reach a consensus.
        </p>
      </div>
    ),
  },
];

const TOTAL_STEPS = SLIDES.length;

// ─── Main component ───────────────────────────────────────────────────────────

export function OnboardingModal({
  isOpen,
  onClose,
  currentUserId,
  isPreview = false,
}: OnboardingModalProps) {
  const [step, setStep] = useState(0); // 0-indexed
  const [imgFailed, setImgFailed] = useState(false);
  const supabase = createClient();

  if (!isOpen) return null;

  const slide = SLIDES[step];
  const n = step + 1;

  // ── persistence ──────────────────────────────────────────────────────────

  const persist = async () => {
    if (!isPreview && currentUserId) {
      await supabase
        .from("profiles")
        .update({ has_seen_onboarding: true })
        .eq("id", currentUserId);
    }
  };

  const handleClose = async () => {
    await persist();
    onClose();
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setImgFailed(false); // Reset image state on slide change
      setStep((s) => s + 1);
    } else {
      handleClose();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setImgFailed(false); // Reset image state on slide change
      setStep((s) => s - 1);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8"
      style={{ isolation: "isolate" }}
    >
      {/* Pitch black backdrop */}
      <div
        className="absolute inset-0 bg-black/95 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className="w-full max-w-[860px] relative flex flex-col md:flex-row items-stretch z-10"
        style={{
          background: "var(--bw-bg-primary)",
          border: "1px solid var(--bw-border)",
          borderRadius: "var(--bw-radius-lg)",
          boxShadow: "var(--bw-shadow-200)",
          padding: "var(--bw-space-6)",
          gap: "var(--bw-space-6)",
          animation: "obm-in 0.2s ease",
          maxHeight: "calc(100vh - 2rem)",
          overflowY: "auto"
        }}
      >
        {/* PREVIEW badge */}
        {isPreview && (
          <div className="absolute top-[24px] left-[24px] z-30 pointer-events-none">
            <span
              style={{
                fontSize: "var(--bw-fs-xs)",
                fontWeight: "var(--bw-fw-bold)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--bw-content-secondary)",
                background: "var(--bw-bg-secondary)",
                padding: "var(--bw-space-1) var(--bw-space-2)",
                borderRadius: "var(--bw-radius-sm)",
                border: "1px solid var(--bw-border)",
              }}
            >
              Preview mode
            </span>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close"
          className="absolute top-[24px] right-[24px] z-30 rounded-full flex items-center justify-center transition-colors"
          style={{
            width: "32px",
            height: "32px",
            color: "var(--bw-content-secondary)",
            background: "transparent",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--bw-content-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--bw-content-secondary)")}
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        {/* Left Panel (40%) */}
        <div
          className="w-full md:w-[40%] flex items-center justify-center relative overflow-hidden"
          style={{
            background: "var(--bw-bg-secondary)",
            borderRadius: "var(--bw-radius-md)",
            minHeight: "320px",
          }}
        >
          {imgFailed ? (
            <span
              style={{
                fontSize: "var(--bw-fs-xs)",
                fontWeight: "var(--bw-fw-bold)",
                letterSpacing: "0.05em",
                color: "var(--bw-content-disabled)",
                textTransform: "uppercase",
              }}
            >
              onboard{n}.gif
            </span>
          ) : (
            <img
              key={`slide-img-${step}`}
              src={`/onboarding/onboard${n}.gif`}
              alt=""
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Right Panel (60%) */}
        <div className="w-full md:w-[60%] flex flex-col justify-between" style={{ paddingTop: "var(--bw-space-4)", paddingRight: "var(--bw-space-6)" }}>
          {/* Content Top */}
          <div style={{ marginTop: "var(--bw-space-8)", minHeight: "340px" }}>
            <p
              style={{
                fontSize: "var(--bw-fs-xs)",
                fontWeight: "var(--bw-fw-bold)",
                letterSpacing: "0.05em",
                color: "var(--bw-content-tertiary)",
                textTransform: "uppercase",
                marginBottom: "var(--bw-space-6)",
              }}
            >
              {slide.eyebrow}
            </p>
            <h1
              style={{
                fontFamily: "var(--bw-font-heading)",
                fontSize: "var(--bw-fs-h2)",
                fontWeight: "var(--bw-fw-bold)",
                lineHeight: "var(--bw-lh-tight)",
                color: "var(--bw-content-primary)",
                marginBottom: "var(--bw-space-4)",
                letterSpacing: "-0.02em",
              }}
            >
              {slide.heading}
            </h1>
            <div
              style={{
                fontSize: "var(--bw-fs-base)",
                lineHeight: "var(--bw-lh-body)",
                color: "var(--bw-content-secondary)",
                paddingRight: "var(--bw-space-4)",
              }}
            >
              {slide.body}
            </div>
          </div>

          {/* Bottom Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "var(--bw-space-8)",
              paddingTop: "var(--bw-space-6)",
              borderTop: "1px solid var(--bw-border)",
              width: "100%",
            }}
          >
            {/* Skip / Back Button */}
            <div className="flex-1 flex justify-start">
              <button
                onClick={step === 0 ? handleClose : handleBack}
                className="transition-colors rounded-full"
                style={{
                  fontSize: "var(--bw-fs-sm)",
                  fontWeight: "var(--bw-fw-medium)",
                  color: "var(--bw-content-secondary)",
                  padding: "10px 16px",
                  marginLeft: "-16px",
                  background: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--bw-content-primary)";
                  e.currentTarget.style.background = "var(--bw-hover-light)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--bw-content-secondary)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {step === 0 ? "Skip guide" : "Back"}
              </button>
            </div>

            {/* Progress Dots */}
            <div className="flex items-center justify-center flex-1 shrink-0" style={{ gap: "var(--bw-space-2)" }}>
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === step ? "24px" : "8px",
                    height: "8px",
                    background: i === step ? "var(--bw-bg-inverse)" : "var(--bw-bg-tertiary)",
                  }}
                />
              ))}
            </div>

            {/* Primary Pill Button */}
            <div className="flex-1 flex justify-end">
              <button
                onClick={step < TOTAL_STEPS - 1 ? handleNext : handleClose}
                className="rounded-full transition-all flex items-center justify-center whitespace-nowrap active:scale-[0.97]"
                style={{
                  background: "var(--bw-bg-inverse)",
                  color: "var(--bw-content-inverse)",
                  fontSize: "var(--bw-fs-base)",
                  fontWeight: "var(--bw-fw-medium)",
                  padding: "14px 20px", // Comfortable padding from DESIGN.md
                  gap: "var(--bw-space-1)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                {step === TOTAL_STEPS - 1 ? "Finish" : step === 0 ? "Get started" : "Next"}
                {step < TOTAL_STEPS - 1 ? <ChevronRight size={18} strokeWidth={2.5} /> : <Check size={18} strokeWidth={2.5} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes obm-in {
          from { opacity: 0; transform: scale(0.98) translateY(4px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
      `}} />
    </div>
  );
}
