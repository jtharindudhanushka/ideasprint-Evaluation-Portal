"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Upload, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

const adminLinks = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/evaluators",
    label: "Evaluators",
    icon: Users,
  },
  {
    href: "/admin/proposals",
    label: "Upload Proposals",
    icon: Upload,
  },
  {
    href: "/admin/assignments",
    label: "Assign Proposals",
    icon: ClipboardList,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-muted/30 p-4 flex flex-col gap-1 shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="mb-4 px-2">
        <h2 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">
          Admin Panel
        </h2>
      </div>
      <nav className="flex flex-col gap-1">
        {adminLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
