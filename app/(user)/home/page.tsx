"use client";

import { Button } from "@/components/ui/Button";
import { MatchCardSkeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-8">

      {/* Header & Wallet Section */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 text-foreground">
            Welcome back, Soldier
          </h1>
          <p className="text-muted text-sm font-medium">
            Ready for your next victory on the battlefield?
          </p>
        </div>

        <div className="wallet-card w-full lg:w-[300px] shrink-0 shadow-lg">
          <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">
            Account Balance
          </div>
          <div className="text-2xl sm:text-3xl font-bold mb-5 tracking-tight">
            {formatCurrency(1240.50)}
          </div>
          <Button className="w-full bg-white text-black hover:bg-gray-100 text-sm">
            Top Up via Razorpay
          </Button>
        </div>
      </div>

      {/* Recommended Tournaments */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-foreground">Recommended Tournaments</h2>
          <Link
            href="/matches"
            className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline shrink-0"
          >
            View All <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Match Card — Live */}
          <div className="card-base group hover:border-primary/20 transition-all cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <span className="status-chip chip-live">● Live</span>
              <span className="text-[11px] font-bold text-muted uppercase tracking-tighter">
                Squad · 5:30 PM
              </span>
            </div>
            <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors">
              BGMI Pro League: Tier 1
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-0.5">
                  Prize Pool
                </div>
                <div className="text-sm font-bold italic">{formatCurrency(25000)}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-0.5">
                  Entry Fee
                </div>
                <div className="text-sm font-bold italic">{formatCurrency(100)}</div>
              </div>
            </div>

            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div className="w-[65%] h-full bg-primary rounded-full" />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-muted">65 / 100 Joined</span>
              <Button className="text-sm px-4 py-2">Join Match</Button>
            </div>
          </div>

          {/* Match Card — Upcoming */}
          <div className="card-base group hover:border-primary/20 transition-all cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <span className="status-chip chip-upcoming">Starts in 2h</span>
              <span className="text-[11px] font-bold text-muted uppercase tracking-tighter">
                Solo · 8:00 PM
              </span>
            </div>
            <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors">
              Valorant Spike Rush Night
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-0.5">
                  Prize Pool
                </div>
                <div className="text-sm font-bold italic">{formatCurrency(10000)}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-0.5">
                  Entry Fee
                </div>
                <div className="text-sm font-bold italic">{formatCurrency(50)}</div>
              </div>
            </div>

            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div className="w-[20%] h-full bg-primary rounded-full" />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-muted">4 / 20 Joined</span>
              <Button className="text-sm px-4 py-2">Join Match</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Finished Skeletons */}
      <section>
        <h2 className="text-base sm:text-lg font-bold mb-4 text-foreground">Recently Finished</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-70">
          <MatchCardSkeleton />
          <MatchCardSkeleton />
        </div>
      </section>

    </div>
  );
}
