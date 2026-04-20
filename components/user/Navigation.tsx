"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Wallet, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Matches", href: "/matches", icon: Trophy },
  { label: "Wallet", href: "/wallet", icon: Wallet },
  { label: "Profile", href: "/profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border px-6 py-3 flex justify-between items-center sm:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 text-[10px] font-medium transition-colors",
              isActive ? "text-primary" : "text-muted hover:text-foreground"
            )}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden sm:flex flex-col w-[280px] h-screen sticky top-0 bg-white border-r border-border p-6 shrink-0">
      <div className="text-xl font-extrabold tracking-tight mb-10">
        BATTLEZONE <span className="text-primary">PRO</span>
      </div>
      
      <nav className="flex flex-col gap-1 flex-1">
        <div className="text-[11px] font-mono text-muted py-2 px-3 uppercase tracking-wider">Navigation</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                isActive 
                  ? "bg-gray-100 text-foreground" 
                  : "text-muted hover:bg-gray-50 hover:text-foreground"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border pt-6">
        <div className="text-[11px] font-mono text-muted py-2 px-3 uppercase tracking-wider mb-2">Internal</div>
        <Link 
          href="/staff/dashboard"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted hover:bg-gray-50 opacity-60"
        >
          <User size={18} />
          Staff Panel
        </Link>
      </div>
    </aside>
  );
}
