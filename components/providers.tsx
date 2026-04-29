"use client";

import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "var(--bw-font-body)",
            fontSize: "var(--bw-fs-sm)",
            borderRadius: "var(--bw-radius-md)",
            background: "var(--bw-bg-primary)",
            color: "var(--bw-content-primary)",
            border: "1px solid var(--bw-border)",
            boxShadow: "var(--bw-shadow-200)",
          },
        }}
      />
      {children}
    </ThemeProvider>
  );
}
