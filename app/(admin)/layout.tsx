import Link from "next/link";
import { LayoutDashboard, Users, Trophy, Settings, Banknote, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Tournaments", href: "/admin/tournaments", icon: Trophy },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Withdrawals", href: "/admin/withdrawals", icon: Banknote },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden">
      {/* Admin Sidebar */}
      <aside className="flex flex-col w-[260px] h-screen bg-gray-900 text-gray-300 shrink-0">
        <div className="flex items-center gap-3 p-6 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <ShieldAlert size={18} className="text-white" />
          </div>
          <div className="font-bold text-white tracking-wide">ADMIN PANEL</div>
        </div>
        
        <nav className="flex flex-col gap-1 px-4 flex-1">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-2 mb-2">Management</div>
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            // Simplified active check since we don't have usePathname in this Server Component
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:text-white hover:bg-white/10"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Admin Main Area */}
      <main className="flex-1 h-full overflow-y-auto relative">
        {/* Top Navbar */}
        <header className="sticky top-0 bg-white border-b border-border h-16 flex items-center justify-between px-8 z-10">
          <h2 className="font-bold text-lg">System Dashboard</h2>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold leading-none">Super Admin</span>
              <span className="text-[10px] text-muted">admin@battlezone.com</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-gray-900 border-2 border-white shadow-sm"></div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
