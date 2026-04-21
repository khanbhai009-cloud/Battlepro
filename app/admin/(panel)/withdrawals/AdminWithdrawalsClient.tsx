"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { formatCurrency } from "@/lib/utils";
import { WithdrawalActions } from "../dashboard/WithdrawalActions";
import { Banknote, RefreshCw } from "lucide-react";

type Withdrawal = {
  id: string;
  userId: string;
  amount: number;
  method?: string;
  status: string;
  createdAt?: any;
  // Hydrated from users/{userId}
  ffName?: string;
  email?: string;
  upiId?: string;
};

export default function AdminWithdrawalsClient({
  initial,
}: {
  initial: Withdrawal[];
}) {
  const [items, setItems] = useState<Withdrawal[]>(initial);
  const [live, setLive] = useState(false);

  // Real-time subscription to pending withdrawals — admin sees new requests
  // the moment a user submits, no refresh required.
  useEffect(() => {
    const q = query(
      collection(db, "withdrawals"),
      where("status", "==", "Pending"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, async (snap) => {
      const raw: Withdrawal[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));

      // Hydrate user fields (ffName / email) for display
      const hydrated = await Promise.all(
        raw.map(async (w) => {
          try {
            const u = await getDoc(doc(db, "users", w.userId));
            const data = u.exists() ? (u.data() as any) : {};
            return {
              ...w,
              ffName: data?.ffName ?? "Player",
              email: data?.email ?? "",
              upiId: data?.upiId ?? "",
            };
          } catch {
            return w;
          }
        })
      );
      setItems(hydrated);
      setLive(true);
    });
    return () => unsub();
  }, []);

  const total = items.length;
  const sumAmount = useMemo(
    () => items.reduce((acc, w) => acc + Number(w.amount ?? 0), 0),
    [items]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Withdrawals</h1>
          <p className="text-muted text-sm font-medium">
            Approve or reject pending withdrawal requests.
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ring-1 ${
            live
              ? "bg-green-50 text-green-700 ring-green-200"
              : "bg-gray-50 text-muted ring-gray-200"
          }`}
          title={live ? "Live updates active" : "Connecting…"}
        >
          <RefreshCw size={12} className={live ? "" : "animate-spin"} />
          {live ? "Live" : "Sync"}
        </span>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="font-bold">Pending Requests ({total})</h2>
          {total > 0 && (
            <span className="text-xs font-bold text-muted">
              Total: {formatCurrency(sumAmount)}
            </span>
          )}
        </div>

        {total === 0 ? (
          <div className="p-12 text-center">
            <Banknote size={36} className="mx-auto text-gray-200 mb-3" />
            <p className="text-muted text-sm font-medium">
              No pending withdrawals. All clear!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((w) => (
              <div
                key={w.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-sm">{w.ffName}</span>
                    {w.email && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {w.email}
                      </span>
                    )}
                    {w.method && (
                      <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase">
                        {w.method}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted font-medium">
                    Manual transfer required · Notify user once sent
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="font-black text-foreground text-lg">
                      {formatCurrency(w.amount)}
                    </div>
                    <div className="text-[10px] text-amber-600 font-bold uppercase">
                      Pending
                    </div>
                  </div>
                  <WithdrawalActions withdrawalId={w.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-amber-800 text-xs font-medium">
          <strong>Note:</strong> Withdrawals are processed manually. After
          approving, transfer the amount via UPI/Bank and mark as done. The
          user&apos;s winning balance has already been deducted upon their
          request.
        </p>
      </div>
    </div>
  );
}
