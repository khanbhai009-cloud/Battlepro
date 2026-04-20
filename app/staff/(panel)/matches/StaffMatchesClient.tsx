"use client";

import { useState } from "react";
import { updateMatchRoomDetails } from "@/actions/match";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Lock, Users, CheckCircle2, Trophy } from "lucide-react";

interface Match {
  id: string;
  name: string;
  game: string;
  mode: string;
  status: string;
  prize: number;
  fee: number;
  roomId?: string;
  roomPass?: string;
  publishRoom?: boolean;
  joinedUsers?: any[];
  max?: number;
}

export function StaffMatchesClient({ matches }: { matches: Match[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [roomIds, setRoomIds] = useState<Record<string, string>>({});
  const [roomPasses, setRoomPasses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, { success: boolean; message: string }>>({});

  const handleUpdate = async (matchId: string, matchName: string) => {
    const roomId = roomIds[matchId]?.trim();
    const roomPass = roomPasses[matchId]?.trim();
    if (!roomId || !roomPass) {
      setResults({ ...results, [matchId]: { success: false, message: "Enter both Room ID and Password." } });
      return;
    }
    setLoading(matchId);
    try {
      const result = await updateMatchRoomDetails(matchId, roomId, roomPass);
      if (result.success) {
        setResults({ ...results, [matchId]: { success: true, message: "Room details sent! Push notifications dispatched to all players." } });
      } else {
        setResults({ ...results, [matchId]: { success: false, message: (result as any).error || "Update failed." } });
      }
    } finally {
      setLoading(null);
    }
  };

  if (matches.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-border">
        <Trophy size={40} className="mx-auto text-gray-200 mb-3" />
        <p className="text-muted text-sm font-medium">No live or upcoming matches.</p>
        <p className="text-muted text-xs mt-1">Ask admin to create tournaments.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => {
        const joined = match.joinedUsers?.length ?? 0;
        const isExpanded = expanded === match.id;
        const result = results[match.id];

        return (
          <div key={match.id} className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
            <div
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpanded(isExpanded ? null : match.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${match.status === "live" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
                    {match.status === "live" ? "● Live" : "Upcoming"}
                  </span>
                  <span className="text-xs text-muted font-medium">{match.game} · {match.mode}</span>
                </div>
                <h3 className="font-bold text-foreground">{match.name}</h3>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted font-medium">
                  <span className="flex items-center gap-1"><Users size={11} />{joined}/{match.max ?? 100} joined</span>
                  <span>Prize: {formatCurrency(match.prize)}</span>
                  {match.publishRoom && <span className="text-green-600 font-bold flex items-center gap-1"><Lock size={11} />Room Published</span>}
                </div>
              </div>
              <div className="text-xs font-bold text-primary shrink-0">
                {isExpanded ? "▲ Collapse" : "▼ Update Room"}
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-border p-4 sm:p-5 space-y-4">
                {match.publishRoom && match.roomId && (
                  <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-xs font-bold text-green-700 mb-1">Current Room Credentials</div>
                    <div className="text-sm font-black tracking-wider">ID: {match.roomId} · Pass: {match.roomPass}</div>
                  </div>
                )}

                {result && (
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${result.success ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
                    {result.success && <CheckCircle2 size={16} />}
                    {result.message}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Room ID</label>
                    <input
                      type="text"
                      className="auth-input font-mono tracking-wider"
                      placeholder="e.g. 4892571"
                      value={roomIds[match.id] ?? ""}
                      onChange={(e) => setRoomIds({ ...roomIds, [match.id]: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Room Password</label>
                    <input
                      type="text"
                      className="auth-input font-mono tracking-wider"
                      placeholder="e.g. BZ2024"
                      value={roomPasses[match.id] ?? ""}
                      onChange={(e) => setRoomPasses({ ...roomPasses, [match.id]: e.target.value })}
                    />
                  </div>
                </div>

                <Button
                  className="w-full py-3 text-sm"
                  onClick={() => handleUpdate(match.id, match.name)}
                  disabled={loading === match.id}
                >
                  {loading === match.id
                    ? <><Loader2 size={15} className="animate-spin" />Sending…</>
                    : <><Lock size={15} />Publish Room & Notify {joined} Players</>}
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
