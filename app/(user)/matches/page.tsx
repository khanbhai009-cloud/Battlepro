import { getAdminDb } from "@/lib/firebase-admin";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Trophy, ChevronRight, Users } from "lucide-react";

export const revalidate = 60;

type TabType = "all" | "live" | "upcoming" | "ended";

async function getMatches() {
  try {
    const db = getAdminDb();
    const snap = await db
      .collection("tournaments")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as any[];
  } catch {
    return [];
  }
}

function MatchCard({ match }: { match: any }) {
  const joined = match.joinedUsers?.length ?? 0;
  const max = match.max ?? 100;
  const pct = Math.min((joined / max) * 100, 100);

  const statusLabel: Record<string, string> = {
    live: "● Live",
    upcoming: "Upcoming",
    ended: "Ended",
  };
  const statusClass: Record<string, string> = {
    live: "chip-live",
    upcoming: "chip-upcoming",
    ended: "bg-gray-100 text-gray-500",
  };

  return (
    <Link href={`/matches/${match.id}`}>
      <div className="card-base group hover:border-primary/30 hover:shadow-md transition-all cursor-pointer h-full">
        <div className="flex justify-between items-start mb-4">
          <span className={`status-chip ${statusClass[match.status] ?? "chip-upcoming"}`}>
            {statusLabel[match.status] ?? match.status}
          </span>
          <span className="text-[11px] font-bold text-muted uppercase tracking-tighter">
            {match.mode ?? "Squad"} · {match.game ?? "BGMI"}
          </span>
        </div>

        <h3 className="text-base font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
          {match.name ?? "Unnamed Tournament"}
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-0.5">Prize Pool</div>
            <div className="text-sm font-bold text-foreground">{formatCurrency(match.prize ?? 0)}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-0.5">Entry Fee</div>
            <div className="text-sm font-bold text-foreground">{formatCurrency(match.fee ?? 0)}</div>
          </div>
        </div>

        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-muted">
            <Users size={12} />
            {joined} / {max} Joined
          </span>
          {match.status !== "ended" && (
            <span className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline">
              View <ChevronRight size={12} />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function EmptyState({ tab }: { tab: string }) {
  return (
    <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-border">
      <Trophy size={40} className="mx-auto text-gray-200 mb-4" />
      <p className="text-muted text-sm font-medium">
        No {tab !== "all" ? tab : ""} tournaments right now.
      </p>
      <p className="text-muted text-xs mt-1">Check back soon!</p>
    </div>
  );
}

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "all" } = await searchParams;
  const activeTab = (["all", "live", "upcoming", "ended"].includes(tab) ? tab : "all") as TabType;

  const allMatches = await getMatches();
  const filtered =
    activeTab === "all"
      ? allMatches
      : allMatches.filter((m) => m.status === activeTab);

  const tabs: { key: TabType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "live", label: "🔴 Live" },
    { key: "upcoming", label: "Upcoming" },
    { key: "ended", label: "Ended" },
  ];

  const liveCount = allMatches.filter((m) => m.status === "live").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-1">Tournaments</h1>
        <p className="text-muted text-sm font-medium">
          {liveCount > 0 ? `${liveCount} match${liveCount > 1 ? "es" : ""} live now` : "Browse all upcoming matches"}
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/matches?tab=${t.key}`}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === t.key
                ? "bg-white text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Match Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          filtered.map((match) => <MatchCard key={match.id} match={match} />)
        )}
      </div>
    </div>
  );
}
