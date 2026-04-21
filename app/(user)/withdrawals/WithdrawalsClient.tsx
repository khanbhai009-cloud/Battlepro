"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownToLine,
  Wallet,
  Banknote,
  Smartphone,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";
import { requestWithdrawal } from "@/actions/wallet-server";

type Method = "UPI" | "Bank" | "Wallet";
type Status = "Pending" | "Completed" | "Rejected" | string;

type Withdrawal = {
  id: string;
  amount: number;
  status: Status;
  method?: Method;
  createdAt?: { _seconds?: number; seconds?: number } | string | number | null;
};

type Props = {
  userId: string;
  initialUser: any;
  initialWithdrawals: Withdrawal[];
};

type Toast = { kind: "success" | "error"; msg: string } | null;

const STATUS_STYLES: Record<string, { bg: string; text: string; ring: string; Icon: any }> = {
  Pending: {
    bg: "bg-yellow-50 dark:bg-yellow-500/10",
    text: "text-yellow-700 dark:text-yellow-400",
    ring: "ring-yellow-200 dark:ring-yellow-500/30",
    Icon: Clock,
  },
  Completed: {
    bg: "bg-green-50 dark:bg-green-500/10",
    text: "text-green-700 dark:text-green-400",
    ring: "ring-green-200 dark:ring-green-500/30",
    Icon: CheckCircle2,
  },
  Approved: {
    bg: "bg-green-50 dark:bg-green-500/10",
    text: "text-green-700 dark:text-green-400",
    ring: "ring-green-200 dark:ring-green-500/30",
    Icon: CheckCircle2,
  },
  Rejected: {
    bg: "bg-red-50 dark:bg-red-500/10",
    text: "text-red-700 dark:text-red-400",
    ring: "ring-red-200 dark:ring-red-500/30",
    Icon: XCircle,
  },
};

function StatusBadge({ status }: { status: Status }) {
  const key = String(status);
  const s = STATUS_STYLES[key] ?? STATUS_STYLES.Pending;
  const Icon = s.Icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ring-1 ${s.bg} ${s.text} ${s.ring}`}
    >
      <Icon size={12} strokeWidth={2.5} />
      {key}
    </span>
  );
}

function MethodIcon({ method }: { method?: Method }) {
  if (method === "Bank") return <Banknote size={14} />;
  if (method === "Wallet") return <Wallet size={14} />;
  return <Smartphone size={14} />;
}

function formatDate(ts: Withdrawal["createdAt"]): string {
  if (!ts) return "—";
  let ms = 0;
  if (typeof ts === "string" || typeof ts === "number") ms = new Date(ts).getTime();
  else if (typeof ts === "object") {
    const sec = (ts as any)._seconds ?? (ts as any).seconds;
    if (sec) ms = sec * 1000;
  }
  if (!ms) return "—";
  return new Date(ms).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function computeWinningBalance(user: any): number {
  return Number(user?.wallets?.winning ?? user?.winningBalance ?? 0);
}

export default function WithdrawalsClient({
  userId,
  initialUser,
  initialWithdrawals,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [method, setMethod] = useState<Method>("UPI");
  const [toast, setToast] = useState<Toast>(null);
  const [user] = useState<any>(initialUser);

  const winningBalance = useMemo(() => computeWinningBalance(user), [user]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const amountNum = Number(amount);
  const amountValid = Number.isFinite(amountNum) && amountNum > 0;
  const balanceOk = amountValid && amountNum <= winningBalance;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setToast({ kind: "error", msg: "User not found. Please log in again." });
      return;
    }
    if (!amountValid) {
      setToast({ kind: "error", msg: "Amount must be greater than 0" });
      return;
    }
    if (!balanceOk) {
      setToast({
        kind: "error",
        msg: `Low balance — you can withdraw up to ₹${winningBalance.toLocaleString()}`,
      });
      return;
    }

    setSubmitting(true);
    const res = await requestWithdrawal(userId, amountNum, method);
    setSubmitting(false);

    if (!res.success) {
      setToast({ kind: "error", msg: res.error || "Withdrawal failed" });
      return;
    }
    setToast({ kind: "success", msg: `Requested ₹${amountNum.toLocaleString()} via ${method}` });
    setAmount("");
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-6 font-[Inter,system-ui,sans-serif]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <ArrowDownToLine className="text-primary" size={22} />
            Withdrawal Management
          </h1>
          <p className="text-xs md:text-sm text-muted mt-1">
            Request payouts and track every withdrawal in one place.
          </p>
        </div>
        <div className="hidden sm:flex flex-col items-end shrink-0 px-4 py-2 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/20">
          <span className="text-[10px] font-bold uppercase text-muted">Winning Balance</span>
          <span className="text-lg font-black text-primary">
            ₹{winningBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Mobile balance card */}
      <div className="sm:hidden rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/20 px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase text-muted">Winning Balance</div>
          <div className="text-2xl font-black text-primary">
            ₹{winningBalance.toLocaleString()}
          </div>
        </div>
        <Wallet className="text-primary/60" size={32} />
      </div>

      {/* Request form */}
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-border bg-white dark:bg-zinc-900 dark:border-zinc-800 shadow-sm p-4 md:p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm md:text-base font-bold text-foreground">
            New Withdrawal Request
          </h2>
          <span className="text-[11px] text-muted">Min ₹100</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3">
          {/* Amount */}
          <div className="space-y-1">
            <label
              htmlFor="amount"
              className="text-[11px] font-bold uppercase text-muted tracking-wide"
            >
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-bold">
                ₹
              </span>
              <input
                id="amount"
                type="number"
                inputMode="numeric"
                min={1}
                step="1"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-7 pr-3 h-11 rounded-xl border border-border bg-background dark:bg-zinc-950 dark:border-zinc-800 text-foreground font-bold text-base focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
            </div>
          </div>

          {/* Method */}
          <div className="space-y-1">
            <label
              htmlFor="method"
              className="text-[11px] font-bold uppercase text-muted tracking-wide"
            >
              Payment Method
            </label>
            <select
              id="method"
              value={method}
              onChange={(e) => setMethod(e.target.value as Method)}
              className="w-full h-11 px-3 rounded-xl border border-border bg-background dark:bg-zinc-950 dark:border-zinc-800 text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            >
              <option value="UPI">UPI</option>
              <option value="Bank">Bank</option>
              <option value="Wallet">Wallet</option>
            </select>
          </div>

          {/* Submit */}
          <div className="flex md:items-end">
            <button
              type="submit"
              disabled={submitting || pending}
              className="w-full md:w-auto h-11 px-5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm shadow-primary/20"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <ArrowDownToLine size={16} />
                  Request Withdrawal
                </>
              )}
            </button>
          </div>
        </div>

        {amount && !amountValid && (
          <div className="flex items-center gap-2 text-xs text-red-600">
            <AlertTriangle size={14} /> Amount must be greater than 0.
          </div>
        )}
        {amountValid && !balanceOk && (
          <div className="flex items-center gap-2 text-xs text-amber-600">
            <AlertTriangle size={14} /> Low balance — max ₹
            {winningBalance.toLocaleString()}.
          </div>
        )}
      </form>

      {/* History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm md:text-base font-bold text-foreground">
            Withdrawal History
          </h2>
          <span className="text-[11px] text-muted">
            {initialWithdrawals.length} request
            {initialWithdrawals.length === 1 ? "" : "s"}
          </span>
        </div>

        {initialWithdrawals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white dark:bg-zinc-900 dark:border-zinc-800 px-4 py-10 text-center">
            <ArrowDownToLine size={28} className="mx-auto text-muted mb-2" />
            <p className="text-sm text-muted">No withdrawal requests yet.</p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {initialWithdrawals.map((w) => (
                <div
                  key={w.id}
                  className="rounded-2xl bg-white dark:bg-zinc-900 border border-border dark:border-zinc-800 shadow-sm p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-lg font-black text-foreground">
                        ₹{Number(w.amount).toLocaleString()}
                      </div>
                      <div className="text-[11px] text-muted mt-0.5 truncate">
                        {formatDate(w.createdAt)}
                      </div>
                    </div>
                    <StatusBadge status={w.status} />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 dark:bg-zinc-800 text-foreground font-bold">
                      <MethodIcon method={w.method} />
                      {w.method ?? "UPI"}
                    </span>
                    <span className="text-[10px] text-muted font-mono truncate max-w-[40%]">
                      #{w.id.slice(0, 8)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block rounded-2xl border border-border bg-white dark:bg-zinc-900 dark:border-zinc-800 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-zinc-950/50">
                  <tr className="text-left text-[11px] font-bold uppercase text-muted tracking-wide">
                    <th className="px-4 py-3">Request ID</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-zinc-800">
                  {initialWithdrawals.map((w) => (
                    <tr
                      key={w.id}
                      className="hover:bg-gray-50/60 dark:hover:bg-zinc-950/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-muted">
                        #{w.id.slice(0, 10)}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {formatDate(w.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 dark:bg-zinc-800 text-foreground font-bold text-xs">
                          <MethodIcon method={w.method} />
                          {w.method ?? "UPI"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-black text-foreground">
                        ₹{Number(w.amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={w.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className={`fixed left-1/2 -translate-x-1/2 bottom-20 md:bottom-8 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 max-w-[90vw] ring-1 ${
            toast.kind === "success"
              ? "bg-green-600 text-white ring-green-700"
              : "bg-red-600 text-white ring-red-700"
          }`}
        >
          {toast.kind === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertTriangle size={16} />
          )}
          <span className="text-sm font-bold">{toast.msg}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 opacity-80 hover:opacity-100"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
