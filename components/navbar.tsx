"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "./theme-toggle";
import { LogOut, ChevronDown, User, Mail, ShieldCheck } from "lucide-react";
import { PasswordChangeForm } from "./password-change-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface NavbarProps {
  fullName?: string;
  role?: string;
}

export function Navbar({ fullName = "", role }: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = React.useState(false);
  const [passwordChanged, setPasswordChanged] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Close dropdown on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: "var(--bw-nav-height)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 var(--bw-space-6)",
        background: "var(--bw-bg-primary)",
        borderBottom: "1px solid var(--bw-border)",
      }}
    >
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--bw-space-3)" }}>
        {/* Uber-style square logo mark */}
        <div
          style={{
            width: 28,
            height: 28,
            background: "var(--bw-bg-inverse)",
            borderRadius: "var(--bw-radius-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--bw-content-inverse)",
            fontFamily: "var(--bw-font-heading)",
            fontWeight: "var(--bw-fw-bold)" as any,
            fontSize: "14px",
          }}
        >
          iS
        </div>
        <div>
          <span
            style={{
              fontFamily: "var(--bw-font-heading)",
              fontWeight: "var(--bw-fw-bold)" as any,
              fontSize: "var(--bw-fs-base)",
              color: "var(--bw-content-primary)",
            }}
          >
            ideasprint 2026
          </span>
          {role && (
            <span
              style={{
                marginLeft: "var(--bw-space-2)",
                fontSize: "var(--bw-fs-xs)",
                color: "var(--bw-content-disabled)",
                textTransform: "capitalize",
              }}
            >
              {role}
            </span>
          )}
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--bw-space-2)" }}>
        <ThemeToggle />

        {/* User dropdown */}
        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--bw-space-2)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "var(--bw-radius-pill)",
              transition: "background var(--bw-duration-normal)",
              color: "var(--bw-content-primary)",
            }}
            className="bw-button--ghost"
          >
            {/* Avatar */}
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "var(--bw-radius-circle)",
                background: "var(--bw-bg-inverse)",
                color: "var(--bw-content-inverse)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "var(--bw-fs-xs)",
                fontWeight: "var(--bw-fw-medium)" as any,
                fontFamily: "var(--bw-font-body)",
              }}
            >
              {initials}
            </div>
            <span
              style={{
                fontSize: "var(--bw-fs-sm)",
                fontWeight: "var(--bw-fw-medium)" as any,
                maxWidth: 120,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              className="hidden sm:inline"
            >
              {fullName || "User"}
            </span>
            <ChevronDown
              size={14}
              style={{
                color: "var(--bw-content-tertiary)",
                transition: "transform var(--bw-duration-normal)",
                transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 4px)",
                background: "var(--bw-bg-primary)",
                borderRadius: "var(--bw-radius-md)",
                boxShadow: "var(--bw-shadow-200)",
                border: "1px solid var(--bw-border)",
                minWidth: 180,
                padding: "var(--bw-space-1) 0",
                animation: "bw-fade-in var(--bw-duration-fast) var(--bw-easing)",
                zIndex: 100,
              }}
            >
              {/* Profile info */}
              <div
                style={{
                  padding: "var(--bw-space-3) var(--bw-space-4)",
                  borderBottom: "1px solid var(--bw-border)",
                }}
              >
                <div
                  style={{
                    fontSize: "var(--bw-fs-sm)",
                    fontWeight: "var(--bw-fw-medium)" as any,
                    color: "var(--bw-content-primary)",
                  }}
                >
                  {fullName || "User"}
                </div>
                {role && (
                  <div
                    style={{
                      fontSize: "var(--bw-fs-xs)",
                      color: "var(--bw-content-tertiary)",
                      textTransform: "capitalize",
                      marginTop: 2,
                    }}
                  >
                    {role}
                  </div>
                )}
              </div>

              {/* Contact Team */}
              <a
                href="mailto:jtharindudhanushka@gmail.com"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--bw-space-2)",
                  width: "100%",
                  padding: "var(--bw-space-3) var(--bw-space-4)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "var(--bw-fs-sm)",
                  color: "var(--bw-content-primary)",
                  transition: "background var(--bw-duration-fast)",
                  textAlign: "left",
                  textDecoration: "none",
                }}
                className="bw-button--ghost"
              >
                <Mail size={14} />
                Contact Team
              </a>

              {/* Change Password */}
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setPasswordModalOpen(true);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--bw-space-2)",
                  width: "100%",
                  padding: "var(--bw-space-3) var(--bw-space-4)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "var(--bw-fs-sm)",
                  color: "var(--bw-content-primary)",
                  transition: "background var(--bw-duration-fast)",
                  textAlign: "left",
                }}
                className="bw-button--ghost"
              >
                <ShieldCheck size={14} />
                Change Password
              </button>

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--bw-space-2)",
                  width: "100%",
                  padding: "var(--bw-space-3) var(--bw-space-4)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "var(--bw-fs-sm)",
                  color: "var(--bw-content-primary)",
                  transition: "background var(--bw-duration-fast)",
                  textAlign: "left",
                }}
                className="bw-button--ghost"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
       </nav>

      <Dialog
        open={passwordModalOpen}
        onOpenChange={(open) => {
          setPasswordModalOpen(open);
          if (!open) setPasswordChanged(false);
        }}
      >
        <DialogContent
          style={{
            maxWidth: 400,
          }}
        >
          {!passwordChanged && (
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <p
                style={{
                  fontSize: "var(--bw-fs-sm)",
                  color: "var(--bw-content-secondary)",
                  marginTop: "var(--bw-space-1)",
                }}
              >
                Enter a new secure password for your account.
              </p>
            </DialogHeader>
          )}

          <div style={{ padding: passwordChanged ? "var(--bw-space-2) var(--bw-space-6) var(--bw-space-6)" : "0 var(--bw-space-6) var(--bw-space-6)" }}>
            <PasswordChangeForm
              onSuccess={() => {
                setPasswordChanged(true);
                setTimeout(() => {
                  setPasswordModalOpen(false);
                  setPasswordChanged(false);
                }, 2000);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
