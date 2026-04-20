"use client";

import { useState } from "react";
import { approveWithdrawal, rejectWithdrawal } from "@/actions/admin";
import { Loader2, Check, X } from "lucide-react";

export function WithdrawalActions({ withdrawalId }: { withdrawalId: string }) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [done, setDone] = useState(false);

  if (done) return <span className="text-xs font-bold text-green-600">Done</span>;

  const handleApprove = async () => {
    setLoading("approve");
    await approveWithdrawal(withdrawalId);
    setDone(true);
  };

  const handleReject = async () => {
    setLoading("reject");
    await rejectWithdrawal(withdrawalId);
    setDone(true);
  };

  return (
    <div className="flex gap-2">
      <button onClick={handleApprove} disabled={!!loading}
        className="bg-black text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-1">
        {loading === "approve" ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Approve
      </button>
      <button onClick={handleReject} disabled={!!loading}
        className="bg-red-50 text-red-600 text-xs font-bold px-3 py-2 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center gap-1">
        {loading === "reject" ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />} Reject
      </button>
    </div>
  );
}
