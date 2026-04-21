import { getAdminDb } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Trophy, Users, Clock, Lock, Map, Swords, Star } from "lucide-react";
import { JoinMatchSection } from "./JoinMatchSection";
import SafeImage from "@/components/SafeImage";

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

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [match, cookieStore] = await Promise.all([getMatch(id), cookies()]);

  if (!match) notFound();

  const userId = cookieStore.get("session")?.value ?? "";
  if (!userId) redirect("/login");

  const joinedUsers: any[] = match.joinedUsers ?? [];
  const joinedSlots = joinedUsers.map((u) => u.slot);
  const myEntry = joinedUsers.find((u) => u.userDocId === userId);
  const userAlreadyJoined = !!myEntry;

  const joined = joinedUsers.length;
  const max = match.max ?? 100;
  const pct = Math.min((joined / max) * 100, 100);
  const pool = match.pool ?? match.prize ?? 0;

  const statusColors: Record<string, string> = {
    Upcoming: "bg-blue-100 text-blue-700", upcoming: "bg-blue-100 text-blue-700",
    Ongoing: "bg-green-100 text-green-700", live: "bg-red-100 text-red-700",
    Results: "bg-amber-100 text-amber-700", ended: "bg-gray-100 text-gray-500",
    Cancelled: "bg-red-100 text-red-600",
  };

  return (
    <div className="space-y-5 max-w-2xl">
      {match.banner && (
        <SafeImage src={match.banner} alt={match.name} className="w-full h-40 object-cover rounded-2xl" />
      )}

      <div>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${statusColors[match.status] ?? "bg-gray-100 text-gray-500"}`}>{match.status}</span>
          <span className="text-xs text-muted font-medium">{match.category ?? match.game} · {match.type ?? match.mode}</span>
          {match.isVipOnly && <span className="text-xs text-amber-600 font-bold">👑 VIP Only</span>}
        </div>
        <h1 className="text-xl font-bold text-foreground">{match.name}</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Prize Pool", value: `₹${pool}`, icon: Trophy, color: "text-amber-500" },
          { label: "Entry Fee", value: `₹${match.fee ?? 0}`, icon: Clock, color: "text-primary" },
          { label: "Per Kill", value: match.perKill > 0 ? `₹${match.perKill}` : "—", icon: Star, color: "text-green-600" },
          { label: "Slots Left", value: String(Math.max(max - joined, 0)), icon: Users, color: joined >= max ? "text-red-500" : "text-green-600" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card-base text-center py-4">
              <Icon size={16} className={`mx-auto mb-1.5 ${stat.color}`} />
              <div className="text-base font-black text-foreground">{stat.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {(match.map || match.serial) && (
        <div className="card-base">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {match.map && <div><div className="text-[10px] text-muted font-bold uppercase mb-1 flex items-center gap-1"><Map size={10} /> Map</div><div className="font-bold">{match.map}</div></div>}
            {match.serial && <div><div className="text-[10px] text-muted font-bold uppercase mb-1">Serial #</div><div className="font-bold">{match.serial}</div></div>}
            {match.time && <div><div className="text-[10px] text-muted font-bold uppercase mb-1">Match Time</div><div className="font-bold">{match.time}</div></div>}
            {match.perKill > 0 && <div><div className="text-[10px] text-muted font-bold uppercase mb-1 flex items-center gap-1"><Swords size={10} /> Per Kill</div><div className="font-bold text-green-600">₹{match.perKill}</div></div>}
          </div>
        </div>
      )}

      <div className="card-base">
        <div className="flex justify-between text-xs font-bold mb-2 text-muted">
          <span>{joined}/{max} players joined</span>
          <span>{Math.max(max - joined, 0)} slots left</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {match.publishRoom && match.roomId && userAlreadyJoined && (
        <div className="card-base border-green-300 bg-green-50">
          <div className="flex items-center gap-2 mb-3">
            <Lock size={16} className="text-green-600" />
            <span className="text-sm font-bold text-green-700">Room Credentials (Joined Players Only)</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] font-bold text-green-700 uppercase tracking-widest mb-1">Room ID</div>
              <div className="font-black text-xl text-foreground tracking-wider select-all">{match.roomId}</div>
            </div>
            {match.roomPass && (
              <div>
                <div className="text-[10px] font-bold text-green-700 uppercase tracking-widest mb-1">Password</div>
                <div className="font-black text-xl text-foreground tracking-wider select-all">{match.roomPass}</div>
              </div>
            )}
          </div>
          {myEntry?.slot && <div className="mt-3 text-sm font-bold text-green-700">Your Slot: #{myEntry.slot}</div>}
        </div>
      )}

      {match.publishRoom && match.roomId && !userAlreadyJoined && (
        <div className="card-base border-amber-200 bg-amber-50">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-amber-600" />
            <span className="text-sm font-bold text-amber-700">Room credentials visible after joining</span>
          </div>
        </div>
      )}

      {match.rules && (
        <div className="card-base">
          <h2 className="font-bold text-sm uppercase tracking-wide text-muted mb-2">Rules</h2>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{match.rules}</p>
        </div>
      )}
      {match.description && !match.rules && (
        <div className="card-base">
          <h2 className="font-bold text-sm uppercase tracking-wide text-muted mb-2">Match Info</h2>
          <p className="text-sm text-foreground leading-relaxed">{match.description}</p>
        </div>
      )}

      <div className="card-base">
        <h2 className="font-bold mb-4 text-foreground">{userAlreadyJoined ? "Your Registration" : "Join This Match"}</h2>
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
