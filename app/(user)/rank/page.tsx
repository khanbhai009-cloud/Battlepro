import { getAdminDb } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Trophy, Medal, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const revalidate = 0;

async function getLeaderboard() {
  try {
    const db = getAdminDb();
    const snap = await db.collection("users").orderBy("currentMonthWinnings", "desc").limit(30).get();
    return snap.docs.map((doc, index) => ({ id: doc.id, rank: index + 1, ...doc.data() }));
  } catch {
    return [];
  }
}

export default async function RankPage() {
  const cookieStore = await cookies();
  const uid = cookieStore.get("session")?.value;
  if (!uid) redirect("/login");
  const players = await getLeaderboard();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Hall of Fame</h1>
        <p className="text-muted text-sm font-medium">The elite warriors of BattleZone Pro.</p>
      </div>

      <div className="space-y-3">
        {players.map((player: any) => (
          <div 
            key={player.id} 
            className="card-base flex items-center justify-between group hover:border-primary/20 transition-all shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center font-bold text-sm border border-border group-hover:bg-primary/5 transition-colors">
                {player.rank === 1 ? <Trophy size={18} className="text-yellow-500" /> : 
                 player.rank === 2 ? <Medal size={18} className="text-gray-400" /> :
                 player.rank === 3 ? <Medal size={18} className="text-amber-600" /> :
                 player.rank}
              </div>
              <div>
                <div className="font-bold text-foreground">{player.ffName || "Mysterious Warrior"}</div>
                <div className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-1">
                  <Star size={8} className="fill-primary text-primary" />
                  LEVEL {Math.floor((player.totalMatches || 0) / 10) + 1}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-black text-primary italic">
                {formatCurrency(player.wallets?.winning || 0)}
              </div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Total Winnings</div>
            </div>
          </div>
        ))}

        {players.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-border mt-10">
            <Trophy size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-muted text-sm font-medium">No champions yet. Will you be the first?</p>
          </div>
        )}
      </div>
    </div>
  );
}
