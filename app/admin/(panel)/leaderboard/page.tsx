import { getLeaderboard } from "@/actions/admin";

export const revalidate = 0;

export default async function LeaderboardPage() {
  const players = await getLeaderboard();

  const rankIcon = (i: number) => {
    if (i === 0) return "🥇";
    if (i === 1) return "🥈";
    if (i === 2) return "🥉";
    return `#${i + 1}`;
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Leaderboard</h1>
        <p className="text-sm text-muted mt-1">Top players by monthly winnings.</p>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Rank</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Player</th>
              <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Monthly Winnings</th>
              <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">VIP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {players.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-muted text-sm">No players found.</td></tr>
            ) : players.map((p: any, i: number) => (
              <tr key={p.id} className={`hover:bg-gray-50 ${i < 3 ? "bg-amber-50/30" : ""}`}>
                <td className="px-4 py-3 font-black text-lg">{rankIcon(i)}</td>
                <td className="px-4 py-3">
                  <div className="font-bold text-foreground">{p.ffName ?? "Player"}</div>
                  <div className="text-xs text-muted">{p.email}</div>
                </td>
                <td className="px-4 py-3 text-right font-black text-green-600">🪙{p.currentMonthWinnings ?? 0}</td>
                <td className="px-4 py-3 text-right">
                  {p.vipExpiry && new Date() < new Date(p.vipExpiry) && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">VIP 👑</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
