"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Trophy, Menu, X, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { destroySession } from "@/actions/session";

const staffNavItems = [
  { label: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard },
  { label: "Matches", href: "/staff/matches", icon: Trophy },
];

export default function StaffPanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 flex flex-col w-[220px] h-screen bg-gray-800 text-gray-300 shrink-0 transition-transform duration-200",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center gap-3 p-5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
            <Swords size={16} className="text-white" />
          </div>
          <div className="font-bold text-white tracking-wide text-sm">STAFF PANEL</div>
        </div>

        <nav className="flex flex-col gap-0.5 px-3 flex-1">
          {staffNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
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

      {/* Main */}
      <main className="flex-1 h-full overflow-y-auto flex flex-col min-w-0">
        <header className="sticky top-0 bg-white border-b border-border h-14 flex items-center justify-between px-4 sm:px-6 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-1.5 rounded-md hover:bg-gray-100" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="font-bold text-sm sm:text-base">Staff Panel</h2>
          </div>
          <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold shrink-0">S</div>
        </header>

        <div className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
