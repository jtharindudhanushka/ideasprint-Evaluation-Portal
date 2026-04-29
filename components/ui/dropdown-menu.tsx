"use client";

import * as React from "react";

/* ═══════════════════════════════════════════════════════════
   Dropdown Menu — Base Web Style
   Clean dropdown with click-outside close
   ═══════════════════════════════════════════════════════════ */

// Not currently used by any page — keeping a stub export to prevent import errors.
// The navbar uses a custom dropdown implementation.

function DropdownMenu({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function DropdownMenuTrigger({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function DropdownMenuContent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

function DropdownMenuItem({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem };
