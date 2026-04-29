import * as React from "react";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = "", style, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={className}
        style={{
          display: "block",
          fontFamily: "var(--bw-font-body)",
          fontSize: "var(--bw-fs-sm)",
          fontWeight: "var(--bw-fw-medium)" as any,
          color: "var(--bw-content-primary)",
          marginBottom: "4px",
          ...style,
        }}
        {...props}
      />
    );
  }
);
Label.displayName = "Label";

export { Label };
