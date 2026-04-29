import * as React from "react";

/* ═══════════════════════════════════════════════════════════
   Badge — Base Web Style
   Pill-shaped tags for status, categories
   ═══════════════════════════════════════════════════════════ */

export type BadgeVariant = "default" | "secondary" | "outline" | "positive" | "negative" | "warning" | "accent";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantMap: Record<BadgeVariant, string> = {
  default: "bw-badge--solid",
  secondary: "bw-badge--secondary",
  outline: "bw-badge--outline",
  positive: "bw-badge--positive",
  negative: "bw-badge--negative",
  warning: "bw-badge--warning",
  accent: "bw-badge--accent",
};

function Badge({ variant = "default", className = "", ...props }: BadgeProps) {
  return (
    <span className={`bw-badge ${variantMap[variant]} ${className}`} {...props} />
  );
}

export { Badge };
