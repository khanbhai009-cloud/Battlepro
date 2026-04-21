"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Trophy, Image, Gift, Users, Bell, MessageSquare, Globe, ClipboardList, BarChart3, Menu, X, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const staffNavItems = [
  { label: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard },
  { label: "Banners", href: "/staff/banners", icon: Image },
  { label: "Tournaments", href: "/staff/matches", icon: Trophy },
  { label: "Prize Distribution", href: "/staff/prize-dist", icon: Gift },
  { label: "User Management", href: "/staff/users", icon: Users },
  { label: "Notifications", href: "/staff/notifications", icon: Bell },
  { label: "VIP Chat", href: "/staff/vip-chat", icon: MessageSquare },
  { label: "Global Chat", href: "/staff/global-chat", icon: Globe },
  { label: "Transactions", href: "/staff/transactions", icon: ClipboardList },
  { label: "Leaderboard", href: "/staff/leaderboard", icon: BarChart3 },
];

async function staffLogout() {
  "use server";
  const { cookies } = await import("next/headers");
  const { redirect } = await import("next/navigation");
  const cookieStore = await cookies();
  cookieStore.delete("staff_session");
  redirect("/staff/login");
}

export default function StaffPanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 flex flex-col w-[210px] h-screen bg-gray-800 text-gray-300 shrink-0 transition-transform duration-200",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center gap-3 p-4 mb-1 border-b border-white/10">
          <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
            <Swords size={14} className="text-white" />
          </div>
          <div className="font-bold text-white tracking-wide text-xs">STAFF PANEL</div>
        </div>

        <nav className="flex flex-col gap-0 px-2 flex-1 overflow-y-auto py-2">
          {staffNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/staff/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
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
          <a href="/staff/login" onClick={async () => { await fetch("/api/staff-logout"); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-900/30 transition-colors">
            Logout
          </a>
        </div>
      </aside>

      <main className="flex-1 h-full overflow-y-auto flex flex-col min-w-0">
        <header className="sticky top-0 bg-white border-b border-border h-12 flex items-center justify-between px-4 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-1.5 rounded-md hover:bg-gray-100" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <h2 className="font-bold text-sm">Staff Panel</h2>
          </div>
          <div className="h-7 w-7 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold shrink-0">S</div>
        </header>

        <div className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
