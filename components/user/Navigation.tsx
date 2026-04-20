"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Wallet, User, BarChart3, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "./NotificationBell";

// Using a placeholder UID for demonstration since we aren't using a complex React Context yet for auth state in this layout
const TEMP_MOCK_USER_ID = "user123";

const navItems = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Matches", href: "/matches", icon: Trophy },
  { label: "Rank", href: "/rank", icon: BarChart3 },
  { label: "Wallet", href: "/wallet", icon: Wallet },
  { label: "Profile", href: "/profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border px-4 py-2 flex justify-between items-center sm:hidden">
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
      <div className="flex items-center justify-between mb-10">
        <div className="text-xl font-extrabold tracking-tight">
          BATTLEZONE <span className="text-primary">PRO</span>
        </div>
        <NotificationBell userId={TEMP_MOCK_USER_ID} />
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
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group",
                isActive 
                  ? "bg-primary/5 text-primary shadow-sm" 
                  : "text-muted hover:bg-gray-50 hover:text-foreground"
              )}
            >
              <Icon size={18} className={cn("transition-colors", isActive ? "text-primary" : "text-muted group-hover:text-foreground")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border pt-6">
        <div className="text-[11px] font-mono text-muted py-2 px-3 uppercase tracking-wider mb-2">Options</div>
        <button 
          className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Secure Logout
        </button>
      </div>
    </aside>
  );
}

