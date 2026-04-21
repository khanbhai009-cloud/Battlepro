"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home,
  Trophy,
  Wallet,
  User,
  BarChart3,
  LogOut,
  Headset,
  MessageSquare,
  MoreHorizontal,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "./NotificationBell";
import { destroySession } from "@/actions/session";

type NavItem = { label: string; href: string; icon: any };

// Full nav (used by the desktop sidebar)
const navItems: NavItem[] = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Matches", href: "/matches", icon: Trophy },
  { label: "Rank", href: "/rank", icon: BarChart3 },
  { label: "Wallet", href: "/wallet", icon: Wallet },
  { label: "Profile", href: "/profile", icon: User },
  { label: "Support", href: "/support", icon: Headset },
  { label: "Chat", href: "/chat", icon: MessageSquare },
];

// Mobile bottom bar — exactly 4 primary destinations + a "More" trigger
const bottomNavItems: NavItem[] = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Matches", href: "/matches", icon: Trophy },
  { label: "Rank", href: "/rank", icon: BarChart3 },
  { label: "Wallet", href: "/wallet", icon: Wallet },
];

// Items hidden behind the "More" sheet on mobile
const moreItems: NavItem[] = [
  { label: "Profile", href: "/profile", icon: User },
  { label: "Support", href: "/support", icon: Headset },
  { label: "Chat", href: "/chat", icon: MessageSquare },
];

export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  // Close the sheet whenever the route changes
  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  // Lock body scroll while the sheet is open
  useEffect(() => {
    if (moreOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [moreOpen]);

  // Close on Escape
  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moreOpen]);

  const moreActive = moreItems.some((m) => pathname.startsWith(m.href));

  return (
    <>
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
                  "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors min-w-0 min-h-[48px] flex-1",
                  isActive ? "text-primary" : "text-muted hover:text-foreground"
                )}
              >
                <Icon
                  size={21}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className="shrink-0"
                />
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

          {/* More trigger — fifth slot */}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={moreOpen}
            aria-label="More options"
            className={cn(
              "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors min-w-0 min-h-[48px] flex-1",
              moreActive || moreOpen
                ? "text-primary"
                : "text-muted hover:text-foreground"
            )}
          >
            <MoreHorizontal
              size={22}
              strokeWidth={moreActive || moreOpen ? 2.5 : 1.8}
              className="shrink-0"
            />
            <span
              className={cn(
                "text-[9px] font-bold uppercase tracking-wide truncate",
                moreActive || moreOpen ? "text-primary" : "text-muted"
              )}
            >
              More
            </span>
          </button>
        </div>
      </nav>

      {/* Bottom sheet (mobile only) */}
      <div
        className={cn(
          "fixed inset-0 z-[60] sm:hidden transition-opacity duration-200",
          moreOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        aria-hidden={!moreOpen}
      >
        {/* Backdrop */}
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMoreOpen(false)}
          className="absolute inset-0 bg-black/40"
        />

        {/* Sheet */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="More menu"
          className={cn(
            "absolute left-0 right-0 bottom-0 bg-white rounded-t-2xl shadow-2xl border-t border-border",
            "pb-[env(safe-area-inset-bottom,12px)] transform transition-transform duration-300 ease-out",
            moreOpen ? "translate-y-0" : "translate-y-full"
          )}
        >
          {/* Grab handle */}
          <div className="flex justify-center pt-2.5 pb-1">
            <span className="block w-10 h-1.5 rounded-full bg-gray-200" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-2 pb-3">
            <h3 className="text-sm font-extrabold tracking-tight text-foreground">
              More
            </h3>
            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              aria-label="Close"
              className="p-1.5 rounded-lg text-muted hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>

          {/* Items */}
          <nav className="px-3 pb-3">
            <ul className="flex flex-col gap-1">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold min-h-[52px] transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-gray-50"
                      )}
                    >
                      <Icon
                        size={20}
                        strokeWidth={isActive ? 2.5 : 2}
                        className={cn(
                          "shrink-0",
                          isActive ? "text-primary" : "text-muted"
                        )}
                      />
                      <span className="flex-1">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-border mt-3 pt-3">
              <form action={destroySession}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 min-h-[52px] transition-colors"
                >
                  <LogOut size={20} className="shrink-0" />
                  Secure Logout
                </button>
              </form>
            </div>
          </nav>
        </div>
      </div>
    </>
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
