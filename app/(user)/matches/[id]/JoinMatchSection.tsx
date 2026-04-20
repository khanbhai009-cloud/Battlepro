"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { joinMatch } from "@/actions/match";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface Props {
  matchId: string;
  userId: string;
  maxSlots: number;
  joinedSlots: number[];
  userAlreadyJoined: boolean;
  matchStatus: string;
}

export function JoinMatchSection({
  matchId,
  userId,
  maxSlots,
  joinedSlots,
  userAlreadyJoined,
  matchStatus,
}: Props) {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [ffName, setFfName] = useState("");
  const [ffUid, setFfUid] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const isTaken = (slot: number) => joinedSlots.includes(slot);
  const isDisabled = matchStatus === "ended" || userAlreadyJoined;

  const handleJoin = async () => {
    if (!selectedSlot || !ffName.trim() || !ffUid.trim()) {
      setResult({ success: false, message: "Please fill in all fields and select a slot." });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await joinMatch(matchId, userId, selectedSlot, ffName.trim(), ffUid.trim());
      if (res.success) {
        setResult({ success: true, message: `You've joined Slot #${selectedSlot}! Good luck, warrior!` });
      } else {
        setResult({ success: false, message: res.error ?? "Failed to join. Please try again." });
      }
    } catch {
      setResult({ success: false, message: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  if (matchStatus === "ended") {
    return (
      <div className="text-center py-6 text-muted text-sm font-medium">
        This tournament has ended.
      </div>
    );
  }

  if (userAlreadyJoined) {
    return (
      <div className="flex items-center gap-3 px-4 py-4 bg-green-50 border border-green-200 rounded-xl">
        <CheckCircle2 size={20} className="text-green-600 shrink-0" />
        <div>
          <div className="font-bold text-green-700 text-sm">You have joined this match!</div>
          <div className="text-xs text-green-600 mt-0.5">Room credentials will be sent as a push notification.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Slot Grid */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-widest text-muted mb-3">
          Select Your Slot ({joinedSlots.length}/{maxSlots} Taken)
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {Array.from({ length: maxSlots }, (_, i) => i + 1).map((slot) => {
            const taken = isTaken(slot);
            const selected = selectedSlot === slot;
            return (
              <button
                key={slot}
                disabled={taken || loading}
                onClick={() => !taken && setSelectedSlot(slot)}
                className={`
                  h-10 rounded-lg text-xs font-bold transition-all
                  ${taken
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                    : selected
                    ? "bg-primary text-white shadow-md scale-105"
                    : "bg-white border border-border hover:border-primary hover:text-primary"
                  }
                `}
              >
                {taken ? "✕" : slot}
              </button>
            );
          })}
        </div>
      </div>

      {/* Player Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-0.5">
            In-Game Name
          </label>
          <input
            type="text"
            className="auth-input"
            placeholder="Your BGMI / FF name"
            value={ffName}
            onChange={(e) => setFfName(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-0.5">
            In-Game UID
          </label>
          <input
            type="text"
            className="auth-input"
            placeholder="Your BGMI / FF UID"
            value={ffUid}
            onChange={(e) => setFfUid(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      {/* Selected Slot Info */}
      {selectedSlot && (
        <div className="px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl text-sm font-medium text-primary">
          Slot <span className="font-black">#{selectedSlot}</span> selected
        </div>
      )}

      {/* Result Banner */}
      {result && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${
          result.success
            ? "bg-green-50 border-green-200 text-green-700"
            : "bg-red-50 border-red-200 text-red-600"
        }`}>
          {result.success
            ? <CheckCircle2 size={18} className="shrink-0" />
            : <AlertCircle size={18} className="shrink-0" />}
          {result.message}
        </div>
      )}

      {/* Join Button */}
      {!result?.success && (
        <Button
          className="w-full py-3 text-sm"
          onClick={handleJoin}
          disabled={loading || !selectedSlot}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Joining…
            </>
          ) : (
            `Join Slot #${selectedSlot ?? "?"} — Pay Entry Fee`
          )}
        </Button>
      )}
    </div>
  );
}
