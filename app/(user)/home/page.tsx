import { getAdminDb } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { HomeBanners } from "./HomeBanners";
import { HomeMatchTabs } from "./HomeMatchTabs";
import SafeImage from "@/components/SafeImage";
import MatchJoinCTA from "@/components/user/MatchJoinCTA";

export const revalidate = 0;

async function getHomeData(uid: string) {
  try {
    const db = getAdminDb();
    const [userDoc, matchSnap, bannersSnap, gamesSnap] = await Promise.all([
      db.collection("users").doc(uid).get(),
      db.collection("tournaments").orderBy("createdAt", "desc").limit(100).get(),
      db.collection("admin_banners").orderBy("createdAt", "desc").get(),
      db.collection("admin_games").get(),
    ]);

    const user = userDoc.exists ? userDoc.data() : null;

    // Strip Firestore Timestamps via JSON round-trip so data is safe to pass to Client Components
    const matches = JSON.parse(
      JSON.stringify(matchSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
    ) as any[];
    const banners = JSON.parse(
      JSON.stringify(bannersSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
    ) as any[];
    const games = JSON.parse(
      JSON.stringify(gamesSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
    ) as any[];

    return { user, matches, banners, games };
  } catch {
    return { user: null, matches: [], banners: [], games: [] };
  }
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const uid = cookieStore.get("session")?.value;
  if (!uid) redirect("/login");

  const { user, matches, banners, games } = await getHomeData(uid);

  // Tolerate multiple wallet schemas (wallets.{deposit,winning,bonus} | walletBalance | balance | wallet)
  const u = (user ?? {}) as any;
  const userBalance = Number(
    (u?.wallets?.deposit ?? 0) +
      (u?.wallets?.winning ?? 0) +
      (u?.wallets?.bonus ?? 0) ||
      u?.walletBalance ||
      u?.balance ||
      u?.wallet ||
      0
  );

  const myMatches = matches.filter((m) =>
    (m.joinedUsers ?? []).some((u: any) => u.userDocId === uid)
  );
  const liveMatches = matches.filter((m) => {
    const status = String(m.status ?? "").toLowerCase();
    return ["upcoming", "ongoing", "live"].includes(status);
  });

  return (
    <div className="space-y-6">
      {/* Hero Banner — 16:9, image only, fade-in */}
      {banners.length > 0 && <HomeBanners banners={banners} />}

      {/* My Matches */}
      <div>
        <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <span>🎮</span> My Matches
        </h2>
        <HomeMatchTabs matches={myMatches} userId={uid} />
      </div>

      {/* Live & Upcoming */}
      {liveMatches.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <span>🔥</span> Live &amp; Upcoming
            </h2>
            <Link href="/matches" className="text-primary text-xs font-bold hover:underline">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {liveMatches.slice(0, 4).map((match: any) => {
              const joined = (match.joinedUsers ?? []).length;
              const max = match.max ?? 100;
              const pct = Math.min((joined / max) * 100, 100);
              const pool = match.pool ?? match.prize ?? 0;
              const fee = Number(match.fee ?? 0);
              const statusKey = String(match.status ?? "").toLowerCase();
              const statusColors: Record<string, string> = {
                upcoming: "bg-blue-100 text-blue-700",
                ongoing: "bg-green-100 text-green-700",
                live: "bg-red-100 text-red-700",
              };
              const alreadyJoined = (match.joinedUsers ?? []).some(
                (j: any) => j.userDocId === uid
              );
              return (
                <div key={match.id} className="card-base hover:border-primary/20 transition-all">
                  <Link href={`/matches/${match.id}`} className="block">
                    {match.banner && (
                      <SafeImage
                        src={match.banner}
                        alt={match.name}
                        className="w-full h-24 object-cover rounded-xl mb-3"
                      />
                    )}
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          statusColors[statusKey] ?? "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {match.status}
                      </span>
                      <span className="text-[10px] font-bold text-muted">
                        {match.category ?? match.game} · {match.type ?? match.mode}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm mb-2 line-clamp-1">{match.name}</h3>
                    <div className="flex justify-between text-xs text-muted mb-2">
                      <span>Pool: <strong className="text-foreground">₹{pool}</strong></span>
                      <span>Fee: <strong className="text-foreground">₹{fee}</strong></span>
                      {match.perKill > 0 && (
                        <span>Kill: <strong className="text-green-600">₹{match.perKill}</strong></span>
                      )}
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-[10px] text-muted mt-1.5 font-medium">
                      {joined}/{max} joined
                    </div>
                  </Link>
                  <MatchJoinCTA
                    matchId={match.id}
                    status={match.status}
                    fee={fee}
                    userBalance={userBalance}
                    alreadyJoined={alreadyJoined}
                    isFull={joined >= max}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Esports Categories */}
      {games.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <span>🕹️</span> Esports Categories
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {games.map((game: any) => (
              <Link key={game.id} href={`/matches?category=${encodeURIComponent(game.name)}`}>
                <div className="bg-white border border-border rounded-xl p-3 flex flex-col items-center gap-2 hover:border-primary/30 transition-all cursor-pointer">
                  {game.url ? (
                    <SafeImage
                      src={game.url}
                      alt={game.name}
                      className="w-10 h-10 object-contain"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                      🎮
                    </div>
                  )}
                  <span className="text-[11px] font-bold text-foreground text-center line-clamp-1">
                    {game.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
