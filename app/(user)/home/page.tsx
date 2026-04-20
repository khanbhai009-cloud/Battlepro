"use client";

import { Button } from "@/components/ui/Button";
import { MatchCardSkeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-10">
      {/* Header & Wallet Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Welcome back, Soldier</h1>
          <p className="text-muted text-sm font-medium">Ready for your next victory on the battlefield?</p>
        </div>

        <div className="wallet-card min-w-[300px] shadow-lg">
          <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Account Balance</div>
          <div className="text-3xl font-bold mb-5 tracking-tight">{formatCurrency(1240.50)}</div>
          <Button className="w-full bg-white text-black hover:bg-gray-100">
            Top Up via Razorpay
          </Button>
        </div>
      </div>

      {/* Recommended Tournaments */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Recommended Tournaments</h2>
          <Link href="/matches" className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline">
            View All <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Featured Match Card */}
          <div className="card-base group hover:border-primary/20 transition-all cursor-pointer">
            <div className="flex justify-between items-start mb-5">
              <span className="status-chip chip-live">● Live</span>
              <span className="text-[11px] font-bold text-muted uppercase tracking-tighter">Squad • 5:30 PM</span>
            </div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">BGMI Pro League: Tier 1</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Prize Pool</div>
                <div className="text-base font-bold italic">{formatCurrency(25000)}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Entry Fee</div>
                <div className="text-base font-bold italic">{formatCurrency(100)}</div>
              </div>
            </div>

            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-5">
              <div className="w-[65%] h-full bg-primary rounded-full" />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-muted tracking-tight">65 / 100 Joined</span>
              <Button>Join Match</Button>
            </div>
          </div>

          {/* Another Match Card */}
          <div className="card-base group hover:border-primary/20 transition-all cursor-pointer">
            <div className="flex justify-between items-start mb-5">
              <span className="status-chip chip-upcoming">Starts in 2h</span>
              <span className="text-[11px] font-bold text-muted uppercase tracking-tighter">Solo • 8:00 PM</span>
            </div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Valorant Spike Rush Night</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Prize Pool</div>
                <div className="text-base font-bold italic">{formatCurrency(10000)}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Entry Fee</div>
                <div className="text-base font-bold italic">{formatCurrency(50)}</div>
              </div>
            </div>

            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-5">
              <div className="w-[20%] h-full bg-primary rounded-full" />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-muted tracking-tight">4 / 20 Joined</span>
              <Button>Join Match</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Loading Skeletons Section */}
      <section className="opacity-80">
        <h2 className="text-lg font-bold mb-6">Recently Finished</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <MatchCardSkeleton />
          <MatchCardSkeleton />
        </div>
      </section>
    </div>
  );
}
