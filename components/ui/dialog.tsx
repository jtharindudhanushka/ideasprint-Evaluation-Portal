"use client";

import * as React from "react";
import { X } from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   Dialog — Base Web Style
   Modal with overlay, animated entry, close button
   ═══════════════════════════════════════════════════════════ */

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue>({
  open: false,
  setOpen: () => {},
});

function Dialog({
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen;

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

function DialogTrigger({
  children,
  className = "",
  asChild,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const { setOpen } = React.useContext(DialogContext);
  
  if (asChild && React.isValidElement(children)) {
    const child = children as any;
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: any) => {
        setOpen(true);
        if (child.props.onClick) child.props.onClick(e);
      },
      ...props
    });
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => setOpen(true)}
      {...props}
    >
      {children}
    </button>
  );
}

function DialogContent({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { open, setOpen } = React.useContext(DialogContext);

  React.useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <>
      <div className="bw-overlay" onClick={() => setOpen(false)} />
      <div className={`bw-dialog ${className}`} style={style} role="dialog" aria-modal="true">
        <button
          onClick={() => setOpen(false)}
          style={{
            position: "absolute",
            top: "var(--bw-space-4)",
            right: "var(--bw-space-4)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--bw-content-tertiary)",
            padding: "4px",
            borderRadius: "var(--bw-radius-circle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "color var(--bw-duration-fast)",
          }}
          aria-label="Close"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </>
  );
}

function DialogHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={className}
      style={{
        padding: "var(--bw-space-6) var(--bw-space-6) var(--bw-space-2)",
      }}
    >
      {children}
    </div>
  );
}

function DialogTitle({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <h2
      className={className}
      style={{
        fontFamily: "var(--bw-font-heading)",
        fontSize: "var(--bw-fs-h4)",
        fontWeight: "var(--bw-fw-bold)" as any,
        lineHeight: "var(--bw-lh-heading)",
        color: "var(--bw-content-primary)",
        paddingRight: "var(--bw-space-8)",
        ...style,
      }}
    >
      {children}
    </h2>
  );
}

function DialogFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={className}
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

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter };
