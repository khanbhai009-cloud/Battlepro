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

  const typeColor = (type: string) => {
    if (["Deposit", "Admin Bonus", "Winning", "Prize Distribution", "Level Bonus", "Signup Bonus", "Referral Bonus", "Redeem Code"].some(t => type.includes(t))) return "text-green-600";
    return "text-foreground";
  };
  const isCredit = (type: string) => ["Deposit", "Bonus", "Winning", "Prize", "Level", "Signup", "Referral", "Redeem"].some(t => type.includes(t));

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          className="auth-input flex-1"
          placeholder="Search by User UID or Email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={loading} className="shrink-0">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
        </Button>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Type / Description</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">User</th>
              <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Amount</th>
              <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {txns.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-muted">
                <ClipboardList size={32} className="mx-auto mb-2 text-gray-200" />
                No transactions found.
              </td></tr>
            ) : txns.map((t: any) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-bold text-foreground">{t.type}</div>
                  {t.desc && <div className="text-xs text-muted mt-0.5 truncate max-w-[200px]">{t.desc}</div>}
                </td>
                <td className="px-4 py-3 text-xs text-muted font-mono">{t.userId?.substring(0, 10)}...</td>
                <td className={`px-4 py-3 text-right font-black ${typeColor(t.type)}`}>
                  {isCredit(t.type) ? "+" : "−"}₹{t.amount ?? 0}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    t.status === "Success" ? "bg-green-100 text-green-700" :
                    t.status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"
                  }`}>{t.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
