"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Trophy, Settings, Banknote, Bell, Image, GamepadIcon, CalendarClock, UserCog, ClipboardList, BarChart3, Menu, X, ShieldAlert, Gift, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { destroySession } from "@/actions/session";

const adminNavItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "App Schedule", href: "/admin/schedule", icon: CalendarClock },
  { label: "Staff Setup", href: "/admin/staff", icon: UserCog },
  { label: "Banners", href: "/admin/banners", icon: Image },
  { label: "Game Categories", href: "/admin/categories", icon: GamepadIcon },
  { label: "Tournaments", href: "/admin/tournaments", icon: Trophy },
  { label: "Prize Distribution", href: "/admin/prize-dist", icon: Gift },
  { label: "Withdrawals", href: "/admin/withdrawals", icon: Banknote },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Transactions", href: "/admin/transactions", icon: ClipboardList },
  { label: "Leaderboard", href: "/admin/leaderboard", icon: BarChart3 },
  { label: "Redeem Codes", href: "/admin/settings", icon: Gift },
  { label: "Support", href: "/admin/support", icon: MessageCircle },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 flex flex-col w-[220px] h-screen bg-gray-900 text-gray-300 shrink-0 transition-transform duration-200",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center gap-3 p-4 mb-1 border-b border-white/10">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <ShieldAlert size={14} className="text-white" />
          </div>
          <div className="font-bold text-white tracking-wide text-xs">ADMIN PANEL</div>
        </div>

        <nav className="flex flex-col gap-0 px-2 flex-1 overflow-y-auto py-2">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                  isActive ? "bg-white/10 text-white" : "hover:text-white hover:bg-white/10"
                )}
              >
                <Icon size={14} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-2 pb-4 border-t border-white/10 pt-2">
          <form action={destroySession}>
            <button type="submit" className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-900/30 transition-colors">
              Logout
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 h-full overflow-y-auto flex flex-col min-w-0">
        <header className="sticky top-0 bg-white border-b border-border h-12 flex items-center justify-between px-4 sm:px-6 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-1.5 rounded-md hover:bg-gray-100" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <h2 className="font-bold text-sm">Admin Panel — BattleZone Pro</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-gray-900 border-2 border-white shadow-sm shrink-0 flex items-center justify-center text-white text-xs font-bold">A</div>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
