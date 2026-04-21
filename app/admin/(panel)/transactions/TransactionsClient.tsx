"use client";
import { useState } from "react";
import { searchUserTransactions } from "@/actions/admin";
import { Button } from "@/components/ui/Button";
import { Loader2, Search, ClipboardList } from "lucide-react";

export function TransactionsClient({ initialTxns }: { initialTxns: any[] }) {
  const [txns, setTxns] = useState(initialTxns);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const res = await searchUserTransactions(query.trim());
    setTxns(res as any[]);
    setLoading(false);
  };

  const handleReset = async () => {
    setQuery("");
    setLoading(true);
    // Re-fetch all by passing nothing; but the action requires a query, so
    // simply reset to whatever the page initially had.
    setTxns(initialTxns);
    setLoading(false);
  };

  const isCredit = (type: string) =>
    [
      "Deposit",
      "Bonus",
      "Winning",
      "Prize",
      "Level",
      "Signup",
      "Referral",
      "Redeem",
    ].some((t) => String(type ?? "").includes(t));

  const statusBadge = (status: string) => {
    const s = String(status ?? "");
    return (
      <span
        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
          s === "Success"
            ? "bg-green-100 text-green-700"
            : s === "Pending"
            ? "bg-amber-100 text-amber-700"
            : "bg-red-100 text-red-600"
        }`}
      >
        {s || "—"}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          className="auth-input flex-1"
          placeholder="Search by User UID or Email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <div className="flex gap-2">
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="flex-1 sm:flex-none shrink-0"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <>
                <Search size={15} /> Search
              </>
            )}
          </Button>
          {query && (
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 text-xs font-bold text-muted border border-border rounded-lg hover:bg-gray-50"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {txns.length === 0 ? (
        <div className="bg-white border border-border rounded-xl py-12 text-center">
          <ClipboardList size={32} className="mx-auto mb-2 text-gray-200" />
          <p className="text-sm text-muted font-medium">
            No transactions found.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {txns.map((t: any) => (
              <div
                key={t.id}
                className="bg-white border border-border rounded-xl p-4 shadow-sm space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-foreground text-sm truncate">
                      {t.type}
                    </div>
                    {t.desc && (
                      <div className="text-xs text-muted mt-0.5 line-clamp-2">
                        {t.desc}
                      </div>
                    )}
                  </div>
                  <div
                    className={`text-base font-black shrink-0 ${
                      isCredit(t.type) ? "text-green-600" : "text-foreground"
                    }`}
                  >
                    {isCredit(t.type) ? "+" : "−"}₹{t.amount ?? 0}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                  <span className="text-[10px] text-muted font-mono truncate max-w-[60%]">
                    {t.userId ? `${String(t.userId).substring(0, 12)}…` : "—"}
                  </span>
                  {statusBadge(t.status)}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                    Type / Description
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                    User
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                    Amount
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {txns.map((t: any) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-foreground">{t.type}</div>
                      {t.desc && (
                        <div className="text-xs text-muted mt-0.5 truncate max-w-[260px]">
                          {t.desc}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted font-mono">
                      {t.userId?.substring(0, 10)}…
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-black ${
                        isCredit(t.type) ? "text-green-600" : "text-foreground"
                      }`}
                    >
                      {isCredit(t.type) ? "+" : "−"}₹{t.amount ?? 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {statusBadge(t.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
