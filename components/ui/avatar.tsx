import * as React from "react";

/* ═══════════════════════════════════════════════════════════
   Avatar — Base Web Style
   Circular with initials fallback
   ═══════════════════════════════════════════════════════════ */

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ size = 32, className = "", style, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "var(--bw-radius-circle)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        ...style,
      }}
      {...props}
    />
  )
);
Avatar.displayName = "Avatar";

function AvatarFallback({
  children,
  className = "",
  style,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={className}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bw-chip)",
        color: "var(--bw-content-primary)",
        fontFamily: "var(--bw-font-body)",
        fontSize: "var(--bw-fs-xs)",
        fontWeight: "var(--bw-fw-medium)" as any,
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}

export { Avatar, AvatarFallback };
