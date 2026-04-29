"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) return <div style={{ width: 36, height: 36 }} />;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title="Toggle theme"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        borderRadius: "var(--bw-radius-circle)",
        border: "none",
        background: "transparent",
        color: "var(--bw-content-primary)",
        cursor: "pointer",
        transition: "background var(--bw-duration-normal) var(--bw-easing)",
        position: "relative",
      }}
      className="bw-button--ghost"
    >
      <Sun
        size={18}
        style={{
          position: "absolute",
          transition: "all var(--bw-duration-normal) var(--bw-easing)",
          transform: isDark ? "rotate(-90deg) scale(0)" : "rotate(0deg) scale(1)",
          opacity: isDark ? 0 : 1,
        }}
      />
      <Moon
        size={18}
        style={{
          position: "absolute",
          transition: "all var(--bw-duration-normal) var(--bw-easing)",
          transform: isDark ? "rotate(0deg) scale(1)" : "rotate(90deg) scale(0)",
          opacity: isDark ? 1 : 0,
        }}
      />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
