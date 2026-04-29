import * as React from "react";

/* ═══════════════════════════════════════════════════════════
   Card — Base Web Style
   Shadow-defined containers, no decorative borders
   ═══════════════════════════════════════════════════════════ */

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "elevated" | "flat" | "featured";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "elevated", className = "", ...props }, ref) => {
    const variantClass =
      variant === "flat" ? "bw-card--flat" : variant === "featured" ? "bw-card--featured" : "";
    return <div ref={ref} className={`bw-card ${variantClass} ${className}`} {...props} />;
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      style={{ padding: "var(--bw-space-6) var(--bw-space-6) var(--bw-space-3)" }}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = "", style, ...props }, ref) => (
    <h3
      ref={ref}
      className={className}
      style={{
        fontFamily: "var(--bw-font-heading)",
        fontSize: "var(--bw-fs-h4)",
        fontWeight: "var(--bw-fw-bold)" as any,
        lineHeight: "var(--bw-lh-heading)",
        color: "var(--bw-content-primary)",
        ...style,
      }}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", style, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      style={{ padding: "var(--bw-space-3) var(--bw-space-6) var(--bw-space-6)", ...style }}
      {...props}
    />
  )
);
CardContent.displayName = "CardContent";

export { Card, CardHeader, CardTitle, CardContent };
