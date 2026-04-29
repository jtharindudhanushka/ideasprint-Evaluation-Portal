"use client";

import * as React from "react";

/* ═══════════════════════════════════════════════════════════
   Tooltip — Base Web Style
   Dark background, appears on hover with delay
   ═══════════════════════════════════════════════════════════ */

function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function Tooltip({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

interface TooltipTriggerProps {
  children: React.ReactNode;
  render?: React.ReactElement;
  asChild?: boolean;
}

function TooltipTrigger({ children, render, asChild }: TooltipTriggerProps) {
  const [show, setShow] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);

  // Find the TooltipContent among siblings — stored in ref
  const contentRef = React.useRef<string>("");

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPosition({
          top: rect.top - 8,
          left: rect.left + rect.width / 2,
        });
      }
      setShow(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShow(false);
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Get tooltip content from children
  const tooltipContent = React.Children.toArray(
    (React.Children.toArray(children) as React.ReactElement[])
  ).find((child: any) => child?.type === TooltipContent);

  const triggerChildren = React.Children.toArray(children).filter(
    (child: any) => child?.type !== TooltipContent
  );

  let triggerElement = render;
  if (!triggerElement) {
    if (asChild && React.isValidElement(triggerChildren[0])) {
      triggerElement = triggerChildren[0] as React.ReactElement;
    } else {
      triggerElement = <span>{triggerChildren}</span>;
    }
  }

  return (
    <div
      ref={triggerRef}
      style={{ display: "inline-flex" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {triggerElement}
      {show && tooltipContent && (
        <div
          ref={tooltipRef}
          className="bw-tooltip"
          style={{
            position: "fixed",
            top: position.top,
            left: position.left,
            transform: "translate(-50%, -100%)",
            pointerEvents: "none",
          }}
        >
          {(tooltipContent as any).props.children}
        </div>
      )}
    </div>
  );
}

function TooltipContent({ children }: { children: React.ReactNode }) {
  // Rendered by TooltipTrigger, not directly
  return null;
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
