"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import SafeImage from "@/components/SafeImage";
import MatchJoinCTA from "@/components/user/MatchJoinCTA";
import { HomeBanners } from "./HomeBanners";
import { HomeMatchTabs } from "./HomeMatchTabs";

type Banner = { id: string; url: string; link?: string };
type Game = { id: string; name: string; url?: string };

type Props = {
  userId: string;
  initialUser: any;
  initialMatches: any[];
  initialBanners: Banner[];
  initialGames: Game[];
};

const STATUS_COLORS: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-700",
  ongoing: "bg-green-100 text-green-700",
  live: "bg-red-100 text-red-700",
};

function computeBalance(user: any): number {
  const u = user ?? {};
  const wallets =
    Number(u?.wallets?.deposit ?? 0) +
    Number(u?.wallets?.winning ?? 0) +
    Number(u?.wallets?.bonus ?? 0);
  return wallets || Number(u?.walletBalance ?? u?.balance ?? u?.wallet ?? 0);
}

export default function HomeClient({
  userId,
  initialUser,
  initialMatches,
  initialBanners,
  initialGames,
}: Props) {
  const router = useRouter();

  const userBalance = computeBalance(initialUser);

  const myMatches = initialMatches.filter((m) =>
    (m.joinedUsers ?? []).some((u: any) => u.userDocId === userId)
  );

  // Case-insensitive — tolerates "Live", "LIVE", "Upcoming", "UPCOMING", etc.
  const liveMatches = initialMatches.filter((m) =>
    ["upcoming", "ongoing", "live"].includes(String(m.status ?? "").toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Banners — empty-state safe */}
      {initialBanners.length > 0 && <HomeBanners banners={initialBanners} />}

      {/* My Matches */}
      <div>
        <h2 className="text-base font-bold text-foreground mb-3">My Matches</h2>
        <HomeMatchTabs matches={myMatches} userId={userId} />
      </div>

      {/* Live & Upcoming */}
      {liveMatches.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-foreground">Live &amp; Upcoming</h2>
            <Link href="/matches" className="text-primary text-xs font-bold hover:underline">
              View All
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
              const alreadyJoined = (match.joinedUsers ?? []).some(
                (j: any) => j.userDocId === userId
              );

              return (
                <div
                  key={match.id}
                  className="card-base hover:border-primary/20 transition-all cursor-pointer"
                  onClick={() => router.push(`/matches/${match.id}`)}
                >
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
                        STATUS_COLORS[statusKey] ?? "bg-gray-100 text-gray-500"
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
                    <span>
                      Pool: <strong className="text-foreground">🪙{pool}</strong>
                    </span>
                    <span>
                      Fee: <strong className="text-foreground">🪙{fee}</strong>
                    </span>
                    {match.perKill > 0 && (
                      <span>
                        Kill: <strong className="text-green-600">🪙{match.perKill}</strong>
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-muted mt-1.5 font-medium">
                    {joined}/{max} joined
                  </div>
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
      {initialGames.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-foreground mb-3">Esports Categories</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {initialGames.map((game: any) => (
              <Link key={game.id} href={`/matches?category=${encodeURIComponent(game.name)}`}>
                <div className="bg-white border border-border rounded-xl p-3 flex flex-col items-center gap-2 hover:border-primary/30 transition-all cursor-pointer">
                  {game.url ? (
                    <SafeImage
                      src={game.url}
                      alt={game.name}
                      className="w-10 h-10 object-contain"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-black text-primary">
                      {(game.name ?? "?").slice(0, 2).toUpperCase()}
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
