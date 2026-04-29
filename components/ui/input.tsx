import * as React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  pill?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", pill, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`bw-input ${pill ? "bw-input--pill" : ""} ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
