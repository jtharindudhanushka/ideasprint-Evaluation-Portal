import * as React from "react";

function Separator({ className = "", style, ...props }: React.HTMLAttributes<HTMLHRElement>) {
  return <hr className={`bw-separator ${className}`} style={style} {...props} />;
}

export { Separator };
