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
    <div className="min-h-[100dvh] bg-[#ffffff] text-[#000000] space-y-6">
      {/* Banners — empty-state safe */}
      {initialBanners.length > 0 && (
        <div className="px-4 py-4">
          <HomeBanners banners={initialBanners} />
        </div>
      )}

      {/* Esports Categories */}
      {initialGames.length > 0 && (
        <div>
          <h2 className="px-4 text-base font-bold text-[#000000] flex items-center gap-2 mb-3">
            <i className="fas fa-trophy text-[#ff8c00]"></i> Esports Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 px-4 pb-4">
            {initialGames.map((game: any) => (
              <Link key={game.id} href={`/matches?category=${encodeURIComponent(game.name)}`}>
                <div className="bg-[#f8f9fa] border border-[#ff8c00] rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg shadow-md hover:scale-105 transform">
                  {game.url ? (
                    <SafeImage
                      src={game.url}
                      alt={game.name}
                      className="w-full aspect-[16/9] object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-[16/9] bg-[#ff8c00]/10 flex items-center justify-center text-sm font-black text-[#ff8c00]">
                      {(game.name ?? "?").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="px-3 py-3 text-sm font-bold text-[#000000] text-center bg-[#f8f9fa]">
                    {game.name}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* My Matches */}
      <div>
        <h2 className="px-4 text-base font-bold text-[#000000] flex items-center gap-2 mb-3">
          <i className="fas fa-gamepad text-[#ff8c00]"></i> My Matches
        </h2>
        <HomeMatchTabs matches={myMatches} userId={userId} />
      </div>

      {/* Live & Upcoming */}
      {liveMatches.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="px-4 text-base font-bold text-[#000000] flex items-center gap-2">
              <i className="fas fa-fire text-[#ff8c00]"></i> Live & Upcoming
            </h2>
            <Link href="/matches" className="text-[#ff8c00] text-xs font-bold hover:underline mr-4">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 px-4">
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
                  className="bg-[#f8f9fa] border border-[#e9ecef] rounded-xl p-5 hover:border-[#ff8c00]/20 transition-all cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  onClick={() => router.push(`/matches/${match.id}`)}
                >
                  {match.banner && (
                    <SafeImage
                      src={match.banner}
                      alt={match.name}
                      className="w-full aspect-[16/9] object-cover rounded-xl mb-4 border-2 border-[#e9ecef] shadow-sm"
                    />
                  )}
                  <div className="flex justify-between items-start mb-3">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold ${
                        STATUS_COLORS[statusKey] ?? "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {match.status}
                    </span>
                    <span className="text-xs font-bold text-[#6c757d]">
                      {match.category ?? match.game} · {match.type ?? match.mode}
                    </span>
                  </div>
                  <h3 className="font-bold text-base mb-3 line-clamp-1 text-[#000000]">{match.name}</h3>
                  <div className="flex justify-between text-sm text-[#6c757d] mb-3">
                    <span>
                      Pool: <strong className="text-[#000000]">🪙{pool}</strong>
                    </span>
                    <span>
                      Fee: <strong className="text-[#000000]">🪙{fee}</strong>
                    </span>
                    {match.perKill > 0 && (
                      <span>
                        Kill: <strong className="text-[#28a745]">🪙{match.perKill}</strong>
                      </span>
                    )}
                  </div>
                  <div className="h-2 bg-[#e9ecef] rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-[#ff8c00] rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-xs text-[#6c757d] mb-3 font-medium">
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
    </div>
  );
}
