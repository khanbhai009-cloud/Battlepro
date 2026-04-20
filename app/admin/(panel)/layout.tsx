"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Trophy, Settings, Banknote, ShieldAlert, Menu, X, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { destroySession } from "@/actions/session";

const adminNavItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Tournaments", href: "/admin/tournaments", icon: Trophy },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Withdrawals", href: "/admin/withdrawals", icon: Banknote },
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
        "fixed lg:static inset-y-0 left-0 z-40 flex flex-col w-[240px] h-screen bg-gray-900 text-gray-300 shrink-0 transition-transform duration-200",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center gap-3 p-5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <ShieldAlert size={16} className="text-white" />
          </div>
          <div className="font-bold text-white tracking-wide text-sm">ADMIN PANEL</div>
        </div>

        <nav className="flex flex-col gap-0.5 px-3 flex-1">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-2 mb-2">Management</div>
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive ? "bg-white/10 text-white" : "hover:text-white hover:bg-white/10"
                )}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-5">
          <form action={destroySession}>
            <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/30 transition-colors">
              Logout
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 h-full overflow-y-auto flex flex-col min-w-0">
        <header className="sticky top-0 bg-white border-b border-border h-14 flex items-center justify-between px-4 sm:px-6 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-1.5 rounded-md hover:bg-gray-100" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="font-bold text-sm sm:text-base">System Dashboard</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold leading-none">Super Admin</span>
              <span className="text-[10px] text-muted">BattleZone Pro</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-gray-900 border-2 border-white shadow-sm shrink-0 flex items-center justify-center text-white text-xs font-bold">A</div>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
