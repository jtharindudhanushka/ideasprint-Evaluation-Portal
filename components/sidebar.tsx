"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Upload,
  ClipboardList,
  Menu,
  X,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/evaluators", label: "Evaluators", icon: Users },
  { href: "/admin/proposals", label: "Proposals", icon: Upload },
  { href: "/admin/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const navContent = (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--bw-space-1)" }}>
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActive(href);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--bw-space-3)",
                padding: "10px 16px",
                borderRadius: "var(--bw-radius-md)",
                fontSize: "var(--bw-fs-sm)",
                fontWeight: active ? ("var(--bw-fw-medium)" as any) : ("var(--bw-fw-regular)" as any),
                color: active ? "var(--bw-content-inverse)" : "var(--bw-content-primary)",
                background: active ? "var(--bw-bg-inverse)" : "transparent",
                transition: "all var(--bw-duration-normal) var(--bw-easing)",
                textDecoration: "none",
              }}
              className={active ? "" : "bw-button--ghost"}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:block"
        style={{
          width: 240,
          flexShrink: 0,
          padding: "var(--bw-space-4) var(--bw-space-3)",
          borderRight: "1px solid var(--bw-border)",
          background: "var(--bw-bg-primary)",
          minHeight: "calc(100vh - var(--bw-nav-height))",
        }}
      >
        <div
          style={{
            fontSize: "var(--bw-fs-xs)",
            fontWeight: "var(--bw-fw-medium)" as any,
            color: "var(--bw-content-disabled)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            padding: "0 16px",
            marginBottom: "var(--bw-space-3)",
          }}
        >
          Admin Panel
        </div>
        {navContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="bw-overlay lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="lg:hidden"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              width: "min(280px, 80vw)",
              background: "var(--bw-bg-primary)",
              zIndex: 101,
              padding: "var(--bw-space-6) var(--bw-space-4)",
              animation: "bw-slide-in-left var(--bw-duration-normal) var(--bw-easing)",
              borderRight: "1px solid var(--bw-border)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "var(--bw-space-6)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--bw-font-heading)",
                  fontWeight: "var(--bw-fw-bold)" as any,
                  fontSize: "var(--bw-fs-lg)",
                  color: "var(--bw-content-primary)",
                }}
              >
                Admin
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--bw-content-tertiary)",
                  padding: "4px",
                }}
                aria-label="Close navigation"
              >
                <X size={20} />
              </button>
            </div>
            {navContent}
          </div>
        </>
      )}
    </>
  );
}
