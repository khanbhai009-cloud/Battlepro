import { getAdminDb } from "@/lib/firebase-admin";
import Link from "next/link";
import { Trophy, Users } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const revalidate = 0;

async function getMatches() {
  try {
    const db = getAdminDb();
    const snap = await db.collection("tournaments").orderBy("createdAt", "desc").limit(100).get();
    const raw = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return JSON.parse(JSON.stringify(raw)) as any[];
  } catch {
    return [];
  }
}

const statusColors: Record<string, string> = {
  Upcoming: "bg-blue-100 text-blue-700",
  upcoming: "bg-blue-100 text-blue-700",
  Ongoing: "bg-green-100 text-green-700",
  live: "bg-red-100 text-red-700",
  Results: "bg-amber-100 text-amber-700",
  ended: "bg-gray-100 text-gray-500",
  Cancelled: "bg-red-100 text-red-600",
};

function MatchCard({ match }: { match: any }) {
  const joined = (match.joinedUsers ?? []).length;
  const max = match.max ?? 100;
  const pct = Math.min((joined / max) * 100, 100);
  const pool = match.pool ?? match.prize ?? 0;

  return (
    <Link href={`/matches/${match.id}`}>
      <div className="card-base group hover:border-primary/30 hover:shadow-md transition-all cursor-pointer h-full flex flex-col">
        {match.banner && (
          <img
            src={match.banner}
            alt={match.name}
            className="w-full h-28 object-cover rounded-xl mb-3"
            onError={(e: any) => (e.currentTarget.style.display = "none")}
          />
        )}
        <div className="flex justify-between items-start mb-3">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              statusColors[match.status] ?? "bg-gray-100 text-gray-500"
            }`}
          >
            {match.status}
          </span>
          <span className="text-[10px] font-bold text-muted">
            {match.category ?? match.game} · {match.type ?? match.mode}
          </span>
        </div>
        <h3 className="text-sm font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2 flex-1">
          {match.name}
        </h3>
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div>
            <div className="text-muted text-[10px] font-bold uppercase">Pool</div>
            <div className="font-black text-foreground">₹{pool}</div>
          </div>
          <div>
            <div className="text-muted text-[10px] font-bold uppercase">Entry</div>
            <div className="font-black text-foreground">₹{match.fee ?? 0}</div>
          </div>
          {match.perKill > 0 && (
            <div>
              <div className="text-muted text-[10px] font-bold uppercase">Per Kill</div>
              <div className="font-black text-green-600">₹{match.perKill}</div>
            </div>
          )}
          {match.map && (
            <div>
              <div className="text-muted text-[10px] font-bold uppercase">Map</div>
              <div className="font-bold text-foreground truncate">{match.map}</div>
            </div>
          )}
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between items-center text-xs text-muted">
          <span className="flex items-center gap-1">
            <Users size={10} />
            {joined}/{max} joined
          </span>
          <span className="text-primary font-bold">View →</span>
        </div>
      </div>
    </Link>
  );
}

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; category?: string }>;
}) {
  const cookieStore = await cookies();
  const uid = cookieStore.get("session")?.value;
  if (!uid) redirect("/login");

  const { tab = "all", category = "" } = await searchParams;

  const allMatches = await getMatches();

  let filtered = category
    ? allMatches.filter(
        (m) => (m.category ?? m.game ?? "").toLowerCase() === category.toLowerCase()
      )
    : allMatches;

  const liveOrOngoing = ["live", "Ongoing"];
  const upcomingStatuses = ["upcoming", "Upcoming"];
  const endedStatuses = ["ended", "Results", "Cancelled"];

  filtered =
    tab === "live"
      ? filtered.filter((m) => liveOrOngoing.includes(m.status))
      : tab === "upcoming"
      ? filtered.filter((m) => upcomingStatuses.includes(m.status))
      : tab === "ended"
      ? filtered.filter((m) => endedStatuses.includes(m.status))
      : filtered;

  const tabs = [
    { key: "all", label: "All" },
    { key: "live", label: "🟢 Ongoing" },
    { key: "upcoming", label: "📅 Upcoming" },
    { key: "ended", label: "🏆 Results" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">{category || "All Tournaments"}</h1>
        <p className="text-muted text-xs mt-0.5">{filtered.length} matches found</p>
      </div>

      {/* Horizontal-scrollable filter tabs */}
      <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl min-w-max">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={`/matches?tab=${t.key}${category ? `&category=${encodeURIComponent(category)}` : ""}`}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                tab === t.key ? "bg-white text-foreground shadow-sm" : "text-muted"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed border-border">
            <Trophy size={36} className="mx-auto text-gray-200 mb-3" />
            <p className="text-muted text-sm">No matches found.</p>
          </div>
        ) : (
          filtered.map((match) => <MatchCard key={match.id} match={match} />)
        )}
      </div>
    </div>
  );
}
