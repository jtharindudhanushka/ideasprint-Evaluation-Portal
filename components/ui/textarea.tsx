import * as React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`bw-input ${className}`}
        style={{ resize: "vertical", minHeight: "80px" }}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
