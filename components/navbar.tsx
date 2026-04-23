"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import type { UserRole } from "@/lib/types/database";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface NavbarProps {
  fullName: string;
  role: UserRole;
}

export function Navbar({ fullName, role }: NavbarProps) {
  const supabase = createClient();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    router.push("/login");
    router.refresh();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="border-b bg-background relative z-50">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center gap-2 font-semibold">
          <Image src="/favicon.svg" alt="ideasprint logo" width={22} height={22} className="shrink-0" />
          <span className="hidden sm:inline-block">ideasprint 2026</span>
        </div>
        
        <div className="ml-auto flex items-center space-x-4">
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="relative flex items-center h-8 w-8 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-transform active:scale-95"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">{getInitials(fullName)}</AvatarFallback>
              </Avatar>
            </button>
            
            {isOpen && (
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-popover border shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in-80 zoom-in-95 slide-in-from-top-2">
                <div className="p-3 border-b">
                  <p className="text-sm font-medium leading-none truncate">{fullName}</p>
                  <p className="text-xs text-muted-foreground capitalize mt-1.5">
                    {role} Role
                  </p>
                </div>
                <div className="p-1">
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
