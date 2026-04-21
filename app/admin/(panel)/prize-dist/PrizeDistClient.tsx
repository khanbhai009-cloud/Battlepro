"use client";
import { useState } from "react";
import { creditMatchWinnings } from "@/actions/admin";
import { Button } from "@/components/ui/Button";
import { Loader2, Trophy } from "lucide-react";

interface Player {
  userDocId: string;
  ffName: string;
  slot?: number;
  kills?: number;
  rankPrize?: number;
  extra?: number;
}

export function PrizeDistClient({ matches }: { matches: any[] }) {
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleMatchChange = (id: string) => {
    const match = matches.find((m) => m.id === id);
    if (!match) { setSelectedMatch(null); setPlayers([]); return; }
    setSelectedMatch(match);
    const uniqueUsers = new Map<string, Player>();
    (match.joinedUsers ?? []).forEach((u: any) => {
      if (!uniqueUsers.has(u.userDocId)) {
        uniqueUsers.set(u.userDocId, { userDocId: u.userDocId, ffName: u.ffName ?? "Player", slot: u.slot, kills: 0, rankPrize: 0, extra: 0 });
      }
    });
    setPlayers(Array.from(uniqueUsers.values()));
  };

  const updatePlayer = (idx: number, field: keyof Player, value: number) => {
    const updated = [...players];
    (updated[idx] as any)[field] = value;
    setPlayers(updated);
  };

  const getTotal = (p: Player) => {
    const perKill = selectedMatch?.perKill ?? 0;
    return (p.kills ?? 0) * perKill + (p.rankPrize ?? 0) + (p.extra ?? 0);
  };

  const handleCredit = async () => {
    if (!selectedMatch) return;
    if (!confirm(`Credit winnings and close match "${selectedMatch.name}"?`)) return;
    setLoading(true);
    const results = players.map((p) => ({
      userId: p.userDocId,
      kills: p.kills ?? 0,
      rankPrize: p.rankPrize ?? 0,
      extra: p.extra ?? 0,
      total: getTotal(p),
    }));
    const res = await creditMatchWinnings(selectedMatch.id, results, "ADMIN");
    setLoading(false);
    if (res.success) {
      setMsg({ type: "success", text: "Winnings credited! Match marked as Results." });
      setSelectedMatch(null); setPlayers([]);
    } else {
      setMsg({ type: "error", text: (res as any).error ?? "Failed" });
    }
    setTimeout(() => setMsg(null), 5000);
  };

  return (
    <div className="space-y-5">
      {msg && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${msg.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
          {msg.text}
        </div>
      )}

      <div className="bg-white border border-border rounded-xl p-5 space-y-3">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Select Ongoing Match</label>
        <select className="auth-input bg-white" onChange={(e) => handleMatchChange(e.target.value)} defaultValue="">
          <option value="">Select Match...</option>
          {matches.map((m) => (
            <option key={m.id} value={m.id}>{m.name} ({(m.joinedUsers ?? []).length} players)</option>
          ))}
        </select>
        {matches.length === 0 && (
          <p className="text-sm text-muted">No ongoing matches. Change a tournament status to "Ongoing" first.</p>
        )}
      </div>

      {selectedMatch && players.length === 0 && (
        <div className="text-center py-10 bg-white border border-border rounded-xl">
          <Trophy size={32} className="mx-auto mb-2 text-gray-200" />
          <p className="text-muted text-sm">No players joined this match yet.</p>
        </div>
      )}

      {players.length > 0 && (
        <div className="space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 font-medium">
            Per Kill Price: <strong>🪙{selectedMatch?.perKill ?? 0}</strong> · Total = (Kills × 🪙{selectedMatch?.perKill ?? 0}) + Rank Prize + Extra
          </div>

          <div className="bg-white border border-border rounded-xl overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Player</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Kills</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Rank Prize (🪙)</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Extra (🪙)</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Total (🪙)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {players.map((p, idx) => (
                  <tr key={p.userDocId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-foreground">{p.ffName}</div>
                      <div className="text-xs text-muted">Slot #{p.slot}</div>
                    </td>
                    <td className="px-4 py-2">
                      <input type="number" min="0" className="auth-input text-center w-20 py-1.5 text-sm" placeholder="0" value={p.kills ?? ""} onChange={(e) => updatePlayer(idx, "kills", Number(e.target.value))} />
                    </td>
                    <td className="px-4 py-2">
                      <input type="number" min="0" className="auth-input text-center w-24 py-1.5 text-sm" placeholder="0" value={p.rankPrize ?? ""} onChange={(e) => updatePlayer(idx, "rankPrize", Number(e.target.value))} />
                    </td>
                    <td className="px-4 py-2">
                      <input type="number" min="0" className="auth-input text-center w-24 py-1.5 text-sm" placeholder="0" value={p.extra ?? ""} onChange={(e) => updatePlayer(idx, "extra", Number(e.target.value))} />
                    </td>
                    <td className="px-4 py-3 text-center font-black text-green-600">🪙{getTotal(p)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={handleCredit} disabled={loading}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <><Trophy size={15} /> Credit Winnings & Close Match</>}
          </Button>
        </div>
      )}
    </div>
  );
}
