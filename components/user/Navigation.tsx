"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Wallet, User, BarChart3, LogOut, Headset, MessageSquare, ArrowDownToLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "./NotificationBell";
import { destroySession } from "@/actions/session";

const navItems = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Matches", href: "/matches", icon: Trophy },
  { label: "Rank", href: "/rank", icon: BarChart3 },
  { label: "Wallet", href: "/wallet", icon: Wallet },
  { label: "Withdraw", href: "/withdrawals", icon: ArrowDownToLine },
  { label: "Profile", href: "/profile", icon: User },
  { label: "Support", href: "/support", icon: Headset },
  { label: "Chat", href: "/chat", icon: MessageSquare },
];

const bottomNavItems = navItems.slice(0, 5);

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border sm:hidden">
      <div className="flex justify-around items-center px-2 py-2 pb-[env(safe-area-inset-bottom,8px)]">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors min-w-0",
                isActive ? "text-primary" : "text-muted hover:text-foreground"
              )}
            >
              <Icon size={21} strokeWidth={isActive ? 2.5 : 1.8} className="shrink-0" />
              <span
                className={cn(
                  "text-[9px] font-bold uppercase tracking-wide truncate",
                  isActive ? "text-primary" : "text-muted"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Sidebar({ userId }: { userId: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden sm:flex flex-col w-[240px] h-screen sticky top-0 bg-white border-r border-border px-4 py-6 shrink-0">
      <div className="flex items-center justify-between mb-8">
        <div className="text-lg font-extrabold tracking-tight text-foreground">
          BATTLEZONE <span className="text-primary">PRO</span>
        </div>
        <NotificationBell userId={userId} />
      </div>

      <nav className="flex flex-col gap-0.5 flex-1">
        <div className="text-[10px] font-bold text-muted uppercase tracking-wider px-3 py-1.5 mb-1">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive
                  ? "bg-primary/5 text-primary"
                  : "text-muted hover:bg-gray-50 hover:text-foreground"
              )}
            >
              <Icon
                size={17}
                strokeWidth={isActive ? 2.5 : 2}
                className={cn(
                  "transition-colors shrink-0",
                  isActive ? "text-primary" : "text-muted group-hover:text-foreground"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border pt-4 mt-4">
        <form action={destroySession}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={17} className="shrink-0" />
            Secure Logout
          </button>
        </form>
      </div>
    </aside>
  );
}
