"use client";

import Link from "next/link";
import { NotificationBell } from "./NotificationBell";

export function TopNavbar({ userId }: { userId: string }) {
  return (
    <header className="sticky top-0 z-30 bg-[#ffffff] border-b border-[#e9ecef] flex items-center justify-between px-4 h-13 sm:hidden shrink-0 shadow-sm">
      <div className="text-base font-extrabold tracking-tight text-[#000000]">
        BATTLE<span className="text-[#ff8c00]">ZONE</span>{" "}
        <span className="text-[#6c757d] font-medium text-sm">PRO</span>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/wallet" className="bg-[#ffaa00]/10 text-[#ffaa00] px-3 py-1 rounded-full text-xs font-bold border border-[#ffaa00]/30 flex items-center gap-1">
          <i className="fas fa-coins"></i> Wallet
        </Link>
        <div className="text-xs font-bold bg-[#28a745]/10 text-[#28a745] px-2 py-1 rounded-full border border-[#28a745]/30 flex items-center gap-1">
          <i className="fas fa-circle text-xs"></i> Live
        </div>
        <NotificationBell userId={userId} />
      </div>
    </header>
  );
}
