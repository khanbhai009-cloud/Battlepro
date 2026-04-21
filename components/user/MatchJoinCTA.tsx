"use client";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type Props = {
  matchId: string;
  status: string;
  fee: number;
  userBalance: number;
  alreadyJoined: boolean;
  isFull: boolean;
};

export default function MatchJoinCTA({
  matchId,
  status,
  fee,
  userBalance,
  alreadyJoined,
  isFull,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"join" | "addcash" | null>(null);

  const s = String(status ?? "").toLowerCase();
  const joinable = s === "upcoming" || s === "live" || s === "ongoing";

  if (alreadyJoined) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          router.push(`/matches/${matchId}`);
        }}
        className="w-full mt-3 py-2 rounded-lg text-xs font-bold bg-green-50 text-green-700 border border-green-200"
      >
        ✓ Joined — View Details
      </button>
    );
  }

  if (!joinable) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          router.push(`/matches/${matchId}`);
        }}
        className="w-full mt-3 py-2 rounded-lg text-xs font-bold bg-gray-100 text-muted"
      >
        View Match
      </button>
    );
  }

  if (isFull) {
    return (
      <button
        type="button"
        disabled
        className="w-full mt-3 py-2 rounded-lg text-xs font-bold bg-gray-100 text-gray-400 cursor-not-allowed"
      >
        Match Full
      </button>
    );
  }

  const needsCash = userBalance < fee;

  if (needsCash) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setLoading("addcash");
          router.push("/wallet");
        }}
        className="w-full mt-3 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors flex items-center justify-center gap-1"
      >
        {loading === "addcash" ? <Loader2 size={12} className="animate-spin" /> : "Add Cash to Join"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setLoading("join");
        router.push(`/matches/${matchId}`);
      }}
      className="w-full mt-3 py-2 rounded-lg text-xs font-bold bg-primary hover:bg-primary/90 text-white transition-colors flex items-center justify-center gap-1"
    >
      {loading === "join" ? <Loader2 size={12} className="animate-spin" /> : "Join Now"}
    </button>
  );
}
