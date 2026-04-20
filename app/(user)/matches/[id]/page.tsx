import { getAdminDb } from "@/lib/firebase-admin";
import { formatCurrency } from "@/lib/utils";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Trophy, Users, Clock, Lock } from "lucide-react";
import { JoinMatchSection } from "./JoinMatchSection";

async function getMatch(id: string) {
  try {
    const db = getAdminDb();
    const doc = await db.collection("tournaments").doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as any;
  } catch {
    return null;
  }
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [match, cookieStore] = await Promise.all([getMatch(id), cookies()]);

  if (!match) notFound();

  const userId = cookieStore.get("session")?.value ?? "";
  const joinedUsers: any[] = match.joinedUsers ?? [];
  const joinedSlots = joinedUsers.map((u) => u.slot);
  const userAlreadyJoined = joinedUsers.some((u) => u.userDocId === userId);

  const joined = joinedUsers.length;
  const max = match.max ?? 100;
  const pct = Math.min((joined / max) * 100, 100);

  const statusLabel: Record<string, string> = {
    live: "● Live Now",
    upcoming: "Upcoming",
    ended: "Ended",
  };
  const statusClass: Record<string, string> = {
    live: "chip-live",
    upcoming: "chip-upcoming",
    ended: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className={`status-chip ${statusClass[match.status] ?? "chip-upcoming"}`}>
            {statusLabel[match.status] ?? match.status}
          </span>
          <span className="text-[11px] font-bold text-muted uppercase tracking-tighter">
            {match.mode ?? "Squad"} · {match.game ?? "BGMI"}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {match.name ?? "Tournament"}
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Prize Pool", value: formatCurrency(match.prize ?? 0), icon: Trophy, color: "text-amber-500" },
          { label: "Entry Fee", value: formatCurrency(match.fee ?? 0), icon: Clock, color: "text-primary" },
          { label: "Total Slots", value: String(max), icon: Users, color: "text-green-600" },
          { label: "Slots Left", value: String(Math.max(max - joined, 0)), icon: Users, color: joined >= max ? "text-red-500" : "text-green-600" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card-base text-center py-4">
              <Icon size={18} className={`mx-auto mb-2 ${stat.color}`} />
              <div className="text-lg font-black text-foreground">{stat.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted mt-0.5">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Progress */}
      <div className="card-base">
        <div className="flex justify-between text-xs font-bold mb-2 text-muted">
          <span>{joined} players joined</span>
          <span>{Math.max(max - joined, 0)} slots left</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Room Info (if published) */}
      {match.publishRoom && match.roomId && (
        <div className="card-base border-green-200 bg-green-50">
          <div className="flex items-center gap-2 mb-3">
            <Lock size={16} className="text-green-600" />
            <span className="text-sm font-bold text-green-700">Room Credentials Released!</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Room ID</div>
              <div className="font-black text-lg text-foreground tracking-wider">{match.roomId}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Password</div>
              <div className="font-black text-lg text-foreground tracking-wider">{match.roomPass}</div>
            </div>
          </div>
        </div>
      )}

      {/* Match Description */}
      {match.description && (
        <div className="card-base">
          <h2 className="font-bold text-sm uppercase tracking-wide text-muted mb-2">Match Rules</h2>
          <p className="text-sm text-foreground leading-relaxed">{match.description}</p>
        </div>
      )}

      {/* Join Section */}
      <div className="card-base">
        <h2 className="font-bold mb-5 text-foreground">
          {userAlreadyJoined ? "Your Registration" : "Join This Match"}
        </h2>
        <JoinMatchSection
          matchId={id}
          userId={userId}
          maxSlots={max}
          joinedSlots={joinedSlots}
          userAlreadyJoined={userAlreadyJoined}
          matchStatus={match.status ?? "upcoming"}
        />
      </div>

    </div>
  );
}
