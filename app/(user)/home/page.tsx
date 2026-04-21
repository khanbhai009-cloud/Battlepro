import { getAdminDb } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { HomeBanners } from "./HomeBanners";
import { HomeMatchTabs } from "./HomeMatchTabs";

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
    const matches = matchSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const banners = bannersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const games = gamesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

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

  const myMatches = (matches as any[]).filter((m) =>
    (m.joinedUsers ?? []).some((u: any) => u.userDocId === uid)
  );

  return (
    <div className="space-y-6">
      {banners.length > 0 && <HomeBanners banners={banners as any[]} />}

      <div>
        <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <span>🎮</span> My Matches
        </h2>
        <HomeMatchTabs matches={myMatches as any[]} userId={uid} />
      </div>

      {(matches as any[]).filter((m) => ["Upcoming", "Ongoing", "live", "upcoming"].includes(m.status)).length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2"><span>🔥</span> Live &amp; Upcoming</h2>
            <Link href="/matches" className="text-primary text-xs font-bold hover:underline">View All →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(matches as any[]).filter((m) => ["Upcoming", "Ongoing", "live", "upcoming"].includes(m.status)).slice(0, 4).map((match: any) => {
              const joined = (match.joinedUsers ?? []).length;
              const max = match.max ?? 100;
              const pct = Math.min((joined / max) * 100, 100);
              const pool = match.pool ?? match.prize ?? 0;
              const statusColors: Record<string, string> = {
                Upcoming: "bg-blue-100 text-blue-700", Ongoing: "bg-green-100 text-green-700",
                live: "bg-red-100 text-red-700", upcoming: "bg-blue-100 text-blue-700",
              };
              return (
                <Link key={match.id} href={`/matches/${match.id}`}>
                  <div className="card-base hover:border-primary/20 transition-all cursor-pointer">
                    {match.banner && <img src={match.banner} alt={match.name} className="w-full h-24 object-cover rounded-xl mb-3" onError={(e) => (e.currentTarget.style.display = "none")} />}
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusColors[match.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {match.status}
                      </span>
                      <span className="text-[10px] font-bold text-muted">{match.category ?? match.game} · {match.type ?? match.mode}</span>
                    </div>
                    <h3 className="font-bold text-sm mb-2 line-clamp-1">{match.name}</h3>
                    <div className="flex justify-between text-xs text-muted mb-2">
                      <span>Pool: <strong className="text-foreground">₹{pool}</strong></span>
                      <span>Fee: <strong className="text-foreground">₹{match.fee ?? 0}</strong></span>
                      {match.perKill > 0 && <span>Kill: <strong className="text-green-600">₹{match.perKill}</strong></span>}
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted mt-1.5 font-medium">
                      <span>{joined}/{max} joined</span>
                      {match.isVipOnly && <span className="text-amber-600 font-bold">👑 VIP Only</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {games.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2"><span>🕹️</span> Esports Categories</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {(games as any[]).map((game: any) => (
              <Link key={game.id} href={`/matches?category=${encodeURIComponent(game.name)}`}>
                <div className="bg-white border border-border rounded-xl p-3 flex flex-col items-center gap-2 hover:border-primary/30 transition-all cursor-pointer">
                  {game.url ? (
                    <img src={game.url} alt={game.name} className="w-10 h-10 object-contain" onError={(e) => (e.currentTarget.style.display = "none")} />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">🎮</div>
                  )}
                  <span className="text-[11px] font-bold text-foreground text-center line-clamp-1">{game.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
