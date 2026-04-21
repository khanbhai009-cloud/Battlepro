"use client";

import Link from "next/link";
import { NotificationBell } from "./NotificationBell";
import { Wallet } from "lucide-react";

export function TopNavbar({ userId }: { userId: string }) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-border flex items-center justify-between px-4 h-13 sm:hidden shrink-0">
      <div className="text-base font-extrabold tracking-tight text-foreground">
        BATTLE<span className="text-primary">ZONE</span>{" "}
        <span className="text-muted font-medium text-sm">PRO</span>
      </div>
      <div className="flex items-center gap-1">
        <Link
          href="/wallet"
          className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
          aria-label="Wallet"
        >
          <Wallet size={19} className="text-muted" />
        </Link>
        <NotificationBell userId={userId} />
      </div>
    </header>
  );
}
