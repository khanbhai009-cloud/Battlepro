"use client";
import { useState } from "react";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";

const tabs = ["Upcoming", "Ongoing", "Results"];
const statusMap: Record<string, string[]> = {
  Upcoming: ["Upcoming", "upcoming"],
  Ongoing: ["Ongoing", "live"],
  Results: ["Results", "ended", "Cancelled"],
};

export function HomeMatchTabs({ matches, userId }: { matches: any[]; userId: string }) {
  const [activeTab, setActiveTab] = useState("Upcoming");

  const filtered = matches.filter((m) => statusMap[activeTab]?.includes(m.status));

  if (matches.length === 0) {
    return (
      <div className="text-center py-8 bg-[#f8f9fa] rounded-xl border border-dashed border-[#e9ecef] mx-4">
        <p className="text-[#6c757d] text-sm">You haven't joined any matches yet.</p>
        <Link href="/matches" className="text-[#ff8c00] text-sm font-bold mt-2 inline-block hover:underline">
          Browse Matches →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 px-4">
      <div className="flex gap-0 bg-[#f0f0f0] rounded-xl p-1 border border-[#e9ecef]">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === tab ? "bg-[#ff8c00] text-white shadow-sm" : "text-[#6c757d]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-6 bg-[#f8f9fa] rounded-xl border border-dashed border-[#e9ecef]">
          <p className="text-[#6c757d] text-xs">No {activeTab.toLowerCase()} matches.</p>
        </div>
      ) : (
        filtered.map((match: any) => {
          const myEntry = (match.joinedUsers ?? []).find((u: any) => u.userDocId === userId);
          const pool = match.pool ?? match.prize ?? 0;
          const statusColors: Record<string, string> = {
            Upcoming: "bg-blue-100 text-blue-700",
            Ongoing: "bg-green-100 text-green-700",
            live: "bg-red-100 text-red-700",
            upcoming: "bg-blue-100 text-blue-700",
            Results: "bg-amber-100 text-amber-700",
            ended: "bg-gray-100 text-gray-500",
            Cancelled: "bg-red-100 text-red-600",
          };
          return (
            <Link key={match.id} href={`/matches/${match.id}`}>
              <div className="bg-[#f8f9fa] border border-[#e9ecef] rounded-xl p-3 hover:border-[#ff8c00]/20 transition-all cursor-pointer flex items-center gap-3 shadow-md hover:shadow-lg">
                {match.banner && (
                  <SafeImage
                    src={match.banner}
                    alt={match.name ?? ""}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border-2 border-[#e9ecef]"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        statusColors[match.status] ?? "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {match.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-[#000000] truncate">{match.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-[#6c757d] mt-1">
                    <span>Pool: 🪙{pool}</span>
                    {myEntry?.slot && <span>Slot #{myEntry.slot}</span>}
                    {match.publishRoom && match.roomId && (
                      <span className="text-[#28a745] font-bold">Room: {match.roomId}</span>
                    )}
                  </div>
                </div>
                <span className="text-[#ff8c00] text-xs font-bold shrink-0">→</span>
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
}
