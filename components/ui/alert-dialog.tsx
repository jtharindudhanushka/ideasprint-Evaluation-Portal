"use client";

import * as React from "react";

/* ═══════════════════════════════════════════════════════════
   AlertDialog — Base Web Style
   Confirmation dialogs with cancel/confirm actions
   ═══════════════════════════════════════════════════════════ */

interface AlertDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const AlertDialogContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({ open: false, setOpen: () => {} });

function AlertDialog({ children, open: controlledOpen, onOpenChange }: AlertDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen;

  return (
    <AlertDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

function AlertDialogContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { open } = React.useContext(AlertDialogContext);
  if (!open) return null;

  return (
    <>
      <div className="bw-overlay" />
      <div className={`bw-dialog ${className}`} role="alertdialog" aria-modal="true">
        {children}
      </div>
    </>
  );
}

function AlertDialogHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: "var(--bw-space-6) var(--bw-space-6) var(--bw-space-2)" }}>
      {children}
    </div>
  );
}

function AlertDialogTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: "var(--bw-font-heading)",
        fontSize: "var(--bw-fs-h4)",
        fontWeight: "var(--bw-fw-bold)" as any,
        lineHeight: "var(--bw-lh-heading)",
        color: "var(--bw-content-primary)",
      }}
    >
      {children}
    </h2>
  );
}

function AlertDialogDescription({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        padding: "var(--bw-space-2) var(--bw-space-6)",
        fontSize: "var(--bw-fs-sm)",
        color: "var(--bw-content-secondary)",
        lineHeight: "var(--bw-lh-body)",
      }}
    >
      {children}
    </p>
  );
}

function AlertDialogFooter({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "var(--bw-space-4) var(--bw-space-6) var(--bw-space-6)",
        display: "flex",
        justifyContent: "flex-end",
        gap: "var(--bw-space-3)",
      }}
    >
      {children}
    </div>
  );
}

function AlertDialogCancel({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = React.useContext(AlertDialogContext);
  return (
    <button
      type="button"
      className="bw-button bw-button--secondary bw-button--sm"
      style={{
        padding: "8px 16px",
        fontSize: "var(--bw-fs-sm)",
        fontWeight: "var(--bw-fw-medium)" as any,
        fontFamily: "var(--bw-font-body)",
        borderRadius: "var(--bw-radius-pill)",
        border: "1px solid var(--bw-border-strong)",
        background: "var(--bw-bg-primary)",
        color: "var(--bw-content-primary)",
        cursor: "pointer",
        transition: "all var(--bw-duration-normal) var(--bw-easing)",
      }}
      onClick={() => setOpen(false)}
      {...props}
    >
      {children}
    </button>
  );
}

function AlertDialogAction({
  children,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="bw-button bw-button--primary bw-button--sm"
      style={{
        padding: "8px 16px",
        fontSize: "var(--bw-fs-sm)",
        fontWeight: "var(--bw-fw-medium)" as any,
        fontFamily: "var(--bw-font-body)",
        borderRadius: "var(--bw-radius-pill)",
        background: "var(--bw-bg-inverse)",
        color: "var(--bw-content-inverse)",
        border: "none",
        cursor: "pointer",
        transition: "all var(--bw-duration-normal) var(--bw-easing)",
      }}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
};
