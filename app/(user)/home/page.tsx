import { getAdminDb } from "@/lib/firebase-admin";
import { formatCurrency } from "@/lib/utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ChevronRight, Users } from "lucide-react";
import Link from "next/link";
import { HomeWalletCard } from "./HomeWalletCard";

export const revalidate = 0;

async function getHomeData(uid: string) {
  try {
    const db = getAdminDb();
    const [userDoc, matchSnap] = await Promise.all([
      db.collection("users").doc(uid).get(),
      db.collection("tournaments")
        .where("status", "in", ["live", "upcoming"])
        .orderBy("createdAt", "desc")
        .limit(4)
        .get(),
    ]);

    const user = userDoc.exists ? userDoc.data() : null;
    const matches = matchSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return { user, matches };
  } catch {
    return { user: null, matches: [] };
  }
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const uid = cookieStore.get("session")?.value;
  if (!uid) redirect("/login");

  const { user, matches } = await getHomeData(uid);

  const depositBalance = user?.wallets?.deposit ?? 0;
  const winningBalance = user?.wallets?.winning ?? 0;
  const bonusBalance = user?.wallets?.bonus ?? 0;
  const totalBalance = depositBalance + winningBalance + bonusBalance;
  const ffName = user?.ffName ?? "Soldier";

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
    <div className="space-y-8">

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 text-foreground">
            {ffName}
          </h1>
          <p className="text-muted text-sm font-medium">
            Ready for your next victory on the battlefield?
          </p>
        </div>

        <HomeWalletCard userId={uid} totalBalance={totalBalance} />
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-foreground">Live &amp; Upcoming</h2>
          <Link
            href="/matches"
            className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline shrink-0"
          >
            View All <ChevronRight size={14} />
          </Link>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-border">
            <p className="text-muted text-sm font-medium">No active tournaments right now. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(matches as any[]).map((match) => {
              const joined = match.joinedUsers?.length ?? 0;
              const max = match.max ?? 100;
              const pct = Math.min((joined / max) * 100, 100);
              return (
                <Link key={match.id} href={`/matches/${match.id}`}>
                  <div className="card-base group hover:border-primary/20 transition-all cursor-pointer h-full">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`status-chip ${statusClass[match.status] ?? "chip-upcoming"}`}>
                        {statusLabel[match.status] ?? match.status}
                      </span>
                      <span className="text-[11px] font-bold text-muted uppercase tracking-tighter">
                        {match.mode ?? "Squad"} · {match.game ?? "BGMI"}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {match.name}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-0.5">Prize Pool</div>
                        <div className="text-sm font-bold italic">{formatCurrency(match.prize ?? 0)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-0.5">Entry Fee</div>
                        <div className="text-sm font-bold italic">{formatCurrency(match.fee ?? 0)}</div>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                        <Users size={12} />
                        {joined} / {max} Joined
                      </span>
                      <span className="text-sm font-bold text-primary">View →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
